import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/email/mailer";
import { renewalReminderTemplate, expiredTemplate } from "@/lib/email/templates";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Invoked by a scheduler (e.g. Vercel Cron) once a day. Protected by a bearer
// token so it can't be triggered by the public.
function authorized(req: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${env.CRON_SECRET}`;
}

async function run() {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead

  // 1) Expire lapsed subscriptions.
  const lapsed = await prisma.subscription.findMany({
    where: { status: "ACTIVE", currentPeriodEnd: { lt: now } },
    include: { user: true, plan: true },
  });
  for (const sub of lapsed) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
    const tpl = expiredTemplate({ planName: sub.plan.name });
    await sendMail({ to: sub.user.email, subject: tpl.subject, html: tpl.html });
    await audit({ action: "SUB_EXPIRED", userId: sub.userId, meta: { subscriptionId: sub.id } });
  }

  // 2) Renewal reminders for subscriptions ending within 3 days (once each).
  // Skip cancelled subs — they opted out of renewing, so a "renew now" nudge
  // would be wrong. They still get expired in step 1 at period end.
  const ending = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { gte: now, lte: soon },
      expiryReminderSentAt: null,
      cancelledAt: null,
    },
    include: { user: true, plan: true },
  });
  for (const sub of ending) {
    const tpl = renewalReminderTemplate({
      planName: sub.plan.name,
      validTill: sub.currentPeriodEnd!.toLocaleDateString("en-IN"),
    });
    await sendMail({ to: sub.user.email, subject: tpl.subject, html: tpl.html });
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { expiryReminderSentAt: now },
    });
    await audit({ action: "SUB_REMINDER_SENT", userId: sub.userId, meta: { subscriptionId: sub.id } });
  }

  return { expired: lapsed.length, reminded: ending.length };
}

export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });
  const result = await run();
  return Response.json({ ok: true, ...result });
}

export async function POST(req: Request) {
  return GET(req);
}
