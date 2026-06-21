import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { sameOrigin, json, badRequest, unauthorized, tooMany } from "@/lib/http";

// User-facing cancellation. There is no auto-renew in this system, so cancelling
// does NOT revoke access immediately; the buyer keeps what they paid for until
// the end of the current period (matching our Terms: "you keep access until the
// end of your current period; we simply won't renew"). We record `cancelledAt`
// and leave the row ACTIVE; the daily cron flips it to EXPIRED once
// currentPeriodEnd passes.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");

  const session = await auth();
  if (!session?.user) return unauthorized();

  const limit = await rateLimit({
    key: `sub-cancel:${session.user.id}`,
    limit: 5,
    windowSeconds: 60,
  });
  if (!limit.ok) return tooMany();

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!sub || sub.status !== "ACTIVE") {
    return badRequest("No active subscription to cancel");
  }
  if (sub.cancelledAt) {
    return badRequest("Subscription is already cancelled");
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { cancelledAt: new Date() },
  });

  await audit({
    action: "SUB_CANCEL",
    userId: session.user.id,
    ip: clientIp(req.headers),
    meta: { subscriptionId: sub.id },
  });

  return json({ ok: true });
}
