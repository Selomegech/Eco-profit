import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import { json, badRequest } from "@/lib/http";
import { requireAdminApi } from "@/lib/admin-auth";
import { activatePaidPayment } from "@/lib/subscription";
import { emailPaymentConfirmation } from "@/lib/invoice/send";
import { rupeesToPaise } from "@/lib/money";

const DAY = 24 * 60 * 60 * 1000;

// Three shapes: act on an existing subscription (CANCEL/GRANT_30/EXPIRE),
// grant a fresh plan for free (GRANT_PLAN), or record a manual/offline
// payment (MANUAL_PAYMENT) - e.g. the client took payment by bank transfer
// or UPI outside the gateway and wants the same invoice + access flow.
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
  z.object({
    action: z.literal("MANUAL_PAYMENT"),
    userId: z.string().min(1),
    planId: z.string().min(1),
    // Rupees actually received; defaults to the plan's list price if omitted.
    amountRupees: z.number().positive().optional(),
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

  // Record an offline payment (bank transfer, UPI, cash, etc.) and run it
  // through the exact same activation + GST invoice path as a real gateway
  // payment, so billing history and invoices stay consistent either way.
  if (parsed.data.action === "MANUAL_PAYMENT") {
    const { userId, planId, amountRupees } = parsed.data;
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.plan.findUnique({ where: { id: planId } }),
    ]);
    if (!user) return badRequest("User not found");
    if (!plan) return badRequest("Plan not found");

    // Reuse the user's existing subscription row so renewals stack, same as
    // the regular checkout flow.
    let subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    subscription = subscription
      ? await prisma.subscription.update({ where: { id: subscription.id }, data: { planId } })
      : await prisma.subscription.create({ data: { userId, planId, status: "PENDING" } });

    const payment = await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        gateway: "MANUAL",
        status: "CREATED",
        // GST-exclusive base, same convention as plan.amountPaise.
        amountPaise: amountRupees ? rupeesToPaise(amountRupees) : plan.amountPaise,
        currency: plan.currency,
      },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { gatewayOrderId: payment.id } });

    const result = await activatePaidPayment({
      gatewayOrderId: payment.id,
      gatewayPaymentId: payment.id,
    });

    await audit({
      action: "ADMIN_MANUAL_PAYMENT",
      userId: gate.userId,
      ip,
      meta: { paymentId: payment.id, targetUser: userId, planId, invoice: result.invoiceNumber },
    });

    try {
      await emailPaymentConfirmation({
        invoiceId: result.invoiceId,
        toEmail: result.userEmail,
        planName: result.planName,
        totalPaise: result.totalPaise,
        validTill: result.validTill,
      });
    } catch (e) {
      console.error("manual payment invoice email failed", e);
    }

    return json({ ok: true, invoiceNumber: result.invoiceNumber });
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
