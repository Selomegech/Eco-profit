import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { env, adminEmails } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const email = parsed.data.email.toLowerCase();

      // Throttle credential attempts per email to blunt brute force.
      const rl = await rateLimit({ key: `login:${email}`, limit: 10, windowSeconds: 300 });
      if (!rl.ok) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return null;

      // Require verified email before allowing login.
      if (!user.emailVerified) return null;

      const ok = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

// Add Google only when configured, so the app still boots without OAuth set up.
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // We do our own email-based account linking in the signIn callback,
      // gated on Google having verified the address - so we don't enable
      // NextAuth's automatic (and riskier) linking.
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Provision (or link) the local User row for Google sign-ins. Runs before
    // the jwt callback, so the row exists when we resolve id/role there.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      // Only trust Google emails that Google itself has verified.
      const email = user.email?.toLowerCase();
      if (!email || profile?.email_verified !== true) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? profile.name ?? null,
            // OAuth user: no password. Google verified the address for us.
            emailVerified: new Date(),
            role: adminEmails.includes(email) ? "ADMIN" : "USER",
          },
        });
        await audit({ action: "AUTH_GOOGLE_SIGNUP", meta: { email } });
      } else if (!existing.emailVerified) {
        // Signing in with Google proves ownership; confirm a pending address.
        await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
    // For Google, the `user` passed here carries the provider id, not ours, so
    // resolve the local row by email to stamp our id + role onto the token.
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
        return token;
      }
      // Credentials / subsequent calls: keep the edge-safe behaviour.
      if (user) {
        token.id = user.id as string;
        token.role = (user.role ?? "USER") as "USER" | "ADMIN";
      }
      return token;
    },
  },
});
