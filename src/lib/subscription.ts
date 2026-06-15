import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { computeGstFromInclusive } from "@/lib/money";
import { nextInvoiceNumber } from "@/lib/invoice/number";

// State-code -> readable name for place-of-supply on invoices.
function stateName(code?: string | null): string {
  if (!code) return env.SELLER_STATE_CODE ? `State ${env.SELLER_STATE_CODE}` : "—";
  return `State ${code}`;
}

export interface ActivationResult {
  alreadyProcessed: boolean;
  invoiceId: string;
  invoiceNumber: string;
  validTill: Date;
  planName: string;
  userEmail: string;
  userName: string | null;
  totalPaise: number;
}

// Idempotently mark a payment paid, extend the subscription window, and issue
// a GST invoice. Safe to call multiple times for the same gateway payment
// (webhook + redirect can both fire) — only the first call mutates state.
export async function activatePaidPayment(opts: {
  gatewayPaymentId: string;
  gatewayOrderId: string;
  gatewaySignature?: string;
}): Promise<ActivationResult> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { gatewayOrderId: opts.gatewayOrderId },
      include: {
        subscription: { include: { plan: true } },
        user: true,
        invoice: true,
      },
    });
    if (!payment) throw new Error(`No payment for order ${opts.gatewayOrderId}`);
    if (!payment.subscription) throw new Error(`Payment ${payment.id} has no subscription`);

    // Idempotency: if already paid and invoiced, return the existing result.
    if (payment.status === "PAID" && payment.invoice) {
      return {
        alreadyProcessed: true,
        invoiceId: payment.invoice.id,
        invoiceNumber: payment.invoice.number,
        validTill: payment.subscription.currentPeriodEnd ?? new Date(),
        planName: payment.subscription.plan.name,
        userEmail: payment.user.email,
        userName: payment.user.name,
        totalPaise: payment.amountPaise,
      };
    }

    const plan = payment.subscription.plan;
    const now = new Date();

    // Extend from the later of "now" and the current period end (stacking).
    const sub = payment.subscription;
    const base =
      sub.status === "ACTIVE" && sub.currentPeriodEnd && sub.currentPeriodEnd > now
        ? sub.currentPeriodEnd
        : now;
    const validTill = new Date(base.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const gst = computeGstFromInclusive({
      totalPaise: payment.amountPaise,
      gstRate: env.GST_RATE,
      buyerStateCode: payment.user.stateCode,
      sellerStateCode: env.SELLER_STATE_CODE,
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        gatewayPaymentId: opts.gatewayPaymentId,
        gatewaySignature: opts.gatewaySignature,
        taxPaise: gst.cgstPaise + gst.sgstPaise + gst.igstPaise,
      },
    });

    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: sub.currentPeriodStart ?? now,
        currentPeriodEnd: validTill,
        cancelledAt: null,
        expiryReminderSentAt: null,
      },
    });

    const number = await nextInvoiceNumber(tx);
    const invoice = await tx.invoice.create({
      data: {
        number,
        userId: payment.userId,
        subscriptionId: sub.id,
        paymentId: payment.id,
        sellerGstin: env.SELLER_GSTIN,
        buyerName: payment.user.billingName ?? payment.user.name ?? payment.user.email,
        buyerGstin: payment.user.gstin,
        buyerState: payment.user.stateCode,
        placeOfSupply: stateName(payment.user.stateCode),
        subtotalPaise: gst.subtotalPaise,
        cgstPaise: gst.cgstPaise,
        sgstPaise: gst.sgstPaise,
        igstPaise: gst.igstPaise,
        totalPaise: gst.totalPaise,
        gstRate: env.GST_RATE,
        sac: env.SELLER_SAC,
        isInterState: gst.isInterState,
      },
    });

    return {
      alreadyProcessed: false,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      validTill,
      planName: plan.name,
      userEmail: payment.user.email,
      userName: payment.user.name,
      totalPaise: payment.amountPaise,
    };
  });
}

// Whether a user currently has app access.
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: { gt: new Date() },
    },
    select: { id: true },
  });
  return !!sub;
}
