import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env, adminEmails } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import { issueToken } from "@/lib/tokens";
import { sendMail } from "@/lib/email/mailer";
import { verifyEmailTemplate } from "@/lib/email/templates";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, tooMany } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(200),
  // Enforce a reasonable password policy.
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(200)
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");

  const ip = clientIp(req.headers);
  const rl = await rateLimit({ key: `register:${ip}`, limit: 5, windowSeconds: 600 });
  if (!rl.ok) return tooMany();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  // Avoid leaking which emails are registered: respond success either way,
  // but only create + email when the account is new.
  if (!existing) {
    const passwordHash = await hashPassword(parsed.data.password);
    const role = adminEmails.includes(email) ? "ADMIN" : "USER";
    const user = await prisma.user.create({
      data: { email, name: parsed.data.name, passwordHash, role },
    });
    const token = await issueToken({
      userId: user.id,
      purpose: "EMAIL_VERIFY",
      ttlMs: 24 * 60 * 60 * 1000,
    });
    const link = `${env.APP_URL}/api/verify-email?token=${token}`;
    const tpl = verifyEmailTemplate(link);
    // Only the verification email at signup. The "choose a plan" welcome email
    // is sent once the user confirms their address (see verify-email route).
    await sendMail({ to: email, subject: tpl.subject, html: tpl.html });
    await audit({ action: "AUTH_REGISTER", userId: user.id, ip });
  }

  return json({ ok: true, message: "Check your email to verify your account." });
}
