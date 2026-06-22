import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import { issueToken } from "@/lib/tokens";
import { sendMail } from "@/lib/email/mailer";
import { verifyEmailTemplate, passwordResetTemplate } from "@/lib/email/templates";
import { json, badRequest } from "@/lib/http";
import { requireAdminApi } from "@/lib/admin-auth";

const schema = z.object({
  userId: z.string().min(1),
  action: z.enum(["RESEND_VERIFICATION", "SEND_PASSWORD_RESET", "VERIFY_EMAIL"]),
});

const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  const gate = await requireAdminApi(req);
  if (gate instanceof Response) return gate;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const { userId, action } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return badRequest("User not found");
  const ip = clientIp(req.headers);

  // Manually mark an email confirmed - for support cases where the user can't
  // receive the verification mail. No token needed.
  if (action === "VERIFY_EMAIL") {
    if (!user.emailVerified) {
      await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
    }
    await audit({ action: "ADMIN_USER_VERIFY_EMAIL", userId: gate.userId, ip, meta: { targetUser: userId } });
    return json({ ok: true });
  }

  // The remaining actions email the user. Build the right token + template.
  let subject: string;
  let html: string;
  if (action === "RESEND_VERIFICATION") {
    if (user.emailVerified) return badRequest("Email already verified");
    const token = await issueToken({ userId, purpose: "EMAIL_VERIFY", ttlMs: 24 * HOUR });
    const tpl = verifyEmailTemplate(`${env.APP_URL}/api/verify-email?token=${token}`);
    subject = tpl.subject;
    html = tpl.html;
  } else {
    // SEND_PASSWORD_RESET - only meaningful for password-based accounts.
    if (!user.passwordHash) return badRequest("Account has no password (OAuth user)");
    const token = await issueToken({ userId, purpose: "PASSWORD_RESET", ttlMs: HOUR });
    const tpl = passwordResetTemplate(`${env.APP_URL}/reset-password?token=${token}`);
    subject = tpl.subject;
    html = tpl.html;
  }

  // A mail outage must surface to the admin (unlike the public, enumeration-safe
  // forgot-password flow) so they know the send didn't go through.
  try {
    await sendMail({ to: user.email, subject, html });
  } catch (err) {
    console.error(`[admin/user] ${action} mail failed:`, err);
    return badRequest("Email could not be sent - check SMTP configuration");
  }

  await audit({ action: `ADMIN_USER_${action}`, userId: gate.userId, ip, meta: { targetUser: userId } });
  return json({ ok: true });
}
