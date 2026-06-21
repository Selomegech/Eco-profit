import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { issueToken } from "@/lib/tokens";
import { sendMail } from "@/lib/email/mailer";
import { passwordResetTemplate } from "@/lib/email/templates";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, tooMany } from "@/lib/http";

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");

  const ip = clientIp(req.headers);
  // Rate limit per IP; resets are cheap to trigger and a common abuse vector.
  const rl = await rateLimit({ key: `forgot:${ip}`, limit: 5, windowSeconds: 600 });
  if (!rl.ok) return tooMany();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Enter a valid email address");

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only issue a token + email a real, password-based account. We respond the
  // same way regardless so the endpoint never reveals whether an email exists.
  if (user && user.passwordHash) {
    const token = await issueToken({
      userId: user.id,
      purpose: "PASSWORD_RESET",
      ttlMs: 60 * 60 * 1000, // 1 hour
    });
    const link = `${env.APP_URL}/reset-password?token=${token}`;
    const tpl = passwordResetTemplate(link);
    // A mail outage (e.g. SMTP timeout) must not crash the request or reveal
    // that the address exists - log and carry on with the generic response.
    try {
      await sendMail({ to: email, subject: tpl.subject, html: tpl.html });
    } catch (err) {
      console.error("[forgot-password] mail send failed:", err);
    }
    await audit({ action: "AUTH_PASSWORD_RESET_REQUEST", userId: user.id, ip });
  }

  return json({
    ok: true,
    message: "If an account exists for that email, a reset link is on its way.",
  });
}
