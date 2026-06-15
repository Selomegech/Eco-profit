import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import { sameOrigin, json, badRequest, unauthorized, forbidden } from "@/lib/http";

const schema = z.object({
  subscriptionId: z.string().min(1),
  action: z.enum(["CANCEL", "GRANT_30", "EXPIRE"]),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "ADMIN") return forbidden();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const sub = await prisma.subscription.findUnique({ where: { id: parsed.data.subscriptionId } });
  if (!sub) return badRequest("Subscription not found");

  const now = new Date();
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
      currentPeriodEnd: new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000),
      cancelledAt: null,
    };
  }

  await prisma.subscription.update({ where: { id: sub.id }, data });
  await audit({
    action: `ADMIN_SUB_${parsed.data.action}`,
    userId: session.user.id,
    ip: clientIp(req.headers),
    meta: { subscriptionId: sub.id, targetUser: sub.userId },
  });

  return json({ ok: true });
}
