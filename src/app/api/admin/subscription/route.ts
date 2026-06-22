import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import { json, badRequest } from "@/lib/http";
import { requireAdminApi } from "@/lib/admin-auth";

const DAY = 24 * 60 * 60 * 1000;

// Two shapes: act on an existing subscription (CANCEL/GRANT_30/EXPIRE), or
// grant a fresh plan to a user by id (GRANT_PLAN). zod discriminates on action.
const schema = z.union([
  z.object({
    action: z.enum(["CANCEL", "GRANT_30", "EXPIRE"]),
    subscriptionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("GRANT_PLAN"),
    userId: z.string().min(1),
    planId: z.string().min(1),
  }),
]);

export async function POST(req: Request) {
  const gate = await requireAdminApi(req);
  if (gate instanceof Response) return gate;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const now = new Date();
  const ip = clientIp(req.headers);

  // Grant a plan to a user: create a fresh ACTIVE subscription for plan
  // duration. Used to comp access or fix a failed-but-paid edge case.
  if (parsed.data.action === "GRANT_PLAN") {
    const { userId, planId } = parsed.data;
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.plan.findUnique({ where: { id: planId } }),
    ]);
    if (!user) return badRequest("User not found");
    if (!plan) return badRequest("Plan not found");

    const sub = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + plan.durationDays * DAY),
      },
    });
    await audit({
      action: "ADMIN_SUB_GRANT_PLAN",
      userId: gate.userId,
      ip,
      meta: { subscriptionId: sub.id, targetUser: userId, planId },
    });
    return json({ ok: true });
  }

  const sub = await prisma.subscription.findUnique({ where: { id: parsed.data.subscriptionId } });
  if (!sub) return badRequest("Subscription not found");

  let data: Record<string, unknown> = {};
  if (parsed.data.action === "CANCEL") {
    data = { status: "CANCELLED", cancelledAt: now };
  } else if (parsed.data.action === "EXPIRE") {
    data = { status: "EXPIRED", currentPeriodEnd: now };
  } else if (parsed.data.action === "GRANT_30") {
    const base = sub.currentPeriodEnd && sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
    data = {
      status: "ACTIVE",
      currentPeriodStart: sub.currentPeriodStart ?? now,
      currentPeriodEnd: new Date(base.getTime() + 30 * DAY),
      cancelledAt: null,
    };
  }

  await prisma.subscription.update({ where: { id: sub.id }, data });
  await audit({
    action: `ADMIN_SUB_${parsed.data.action}`,
    userId: gate.userId,
    ip,
    meta: { subscriptionId: sub.id, targetUser: sub.userId },
  });

  return json({ ok: true });
}
