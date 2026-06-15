import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Node-only deps). Used by middleware for coarse
// route gating and shared by the full config in src/auth.ts.
// Fine-grained checks (active subscription, admin role at the data layer)
// are enforced again in server components / route handlers (defense in depth).

const PROTECTED_PREFIXES = ["/dashboard", "/app", "/admin", "/billing", "/account"];
const ADMIN_PREFIXES = ["/admin"];

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // real providers added in src/auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";

      const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
      const needsAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

      if (needsAdmin) return isLoggedIn && isAdmin;
      if (needsAuth) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role ?? "USER") as "USER" | "ADMIN";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
