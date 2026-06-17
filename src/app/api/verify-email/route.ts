import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { consumeToken } from "@/lib/tokens";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/email/mailer";
import { welcomeTemplate } from "@/lib/email/templates";

// Email links are GET; we redirect to a friendly page either way.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const userId = token ? await consumeToken({ raw: token, purpose: "EMAIL_VERIFY" }) : null;

  if (!userId) {
    return NextResponse.redirect(new URL("/login?verified=invalid", env.APP_URL));
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  await audit({ action: "AUTH_EMAIL_VERIFIED", userId });

  // Now that the address is confirmed, send the welcome / choose-a-plan email.
  const w = welcomeTemplate(user.name ?? "");
  await sendMail({ to: user.email, subject: w.subject, html: w.html });

  return NextResponse.redirect(new URL("/login?verified=1", env.APP_URL));
}
