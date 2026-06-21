import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
// Stripe and Razorpay are paused (commented out below) but kept here so the
// client can switch them back on later without re-wiring anything.
// import { stripe, stripeConfigured } from "@/lib/payments/stripe";
// import { razorpay, razorpayConfigured } from "@/lib/payments/razorpay";
import { initiatePay, phonepeConfigured } from "@/lib/payments/phonepe";
import { grossFromBase } from "@/lib/money";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, unauthorized, tooMany } from "@/lib/http";

const schema = z.object({
  planCode: z.string().min(1),
  // Stripe / Razorpay temporarily disabled. Only PhonePe is accepted.
  gateway: z.enum(["PHONEPE"]),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");

  const session = await auth();
  if (!session?.user) return unauthorized();

  const ip = clientIp(req.headers);
  const rl = await rateLimit({ key: `checkout:${session.user.id}`, limit: 10, windowSeconds: 300 });
  if (!rl.ok) return tooMany();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const plan = await prisma.plan.findUnique({ where: { code: parsed.data.planCode } });
  if (!plan || !plan.isActive) return badRequest("Unknown plan");

  // Reuse the user's existing subscription row so renewals stack; otherwise create.
  let subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  subscription = subscription
    ? await prisma.subscription.update({
        where: { id: subscription.id },
        data: { planId: plan.id },
      })
    : await prisma.subscription.create({
        data: { userId: session.user.id, planId: plan.id, status: "PENDING" },
      });

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      subscriptionId: subscription.id,
      gateway: parsed.data.gateway,
      status: "CREATED",
      amountPaise: plan.amountPaise,
      currency: plan.currency,
    },
  });

  // Charge the GST-inclusive total (base price + 18% GST on top). plan.amountPaise
  // is the GST-exclusive base; the invoice issued on activation itemises the tax.
  const grossPaise = grossFromBase(plan.amountPaise, env.GST_RATE);

  // ── PhonePe (active gateway) ───────────────────────────────────────────────
  if (parsed.data.gateway === "PHONEPE") {
    if (!phonepeConfigured()) return badRequest("PhonePe is not configured");
    // We key the PhonePe transaction by our payment.id, so gatewayOrderId == id.
    const init = await initiatePay({
      merchantTransactionId: payment.id,
      merchantUserId: session.user.id,
      amountPaise: grossPaise,
      redirectUrl: `${env.APP_URL}/api/phonepe/callback?id=${payment.id}`,
      callbackUrl: `${env.APP_URL}/api/phonepe/callback?id=${payment.id}`,
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: payment.id },
    });
    await audit({ action: "CHECKOUT_CREATED", userId: session.user.id, ip, meta: { gateway: "PHONEPE", plan: plan.code } });
    return json({ gateway: "PHONEPE", url: init.redirectUrl });
  }

  // ── Stripe (paused, kept for future re-enable) ────────────────────────────
  // if (parsed.data.gateway === "STRIPE") {
  //   if (!stripeConfigured()) return badRequest("Stripe is not configured");
  //   const checkout = await stripe().checkout.sessions.create({
  //     mode: "payment",
  //     customer_email: session.user.email,
  //     client_reference_id: payment.id,
  //     metadata: { paymentId: payment.id },
  //     line_items: [
  //       {
  //         quantity: 1,
  //         price_data: {
  //           currency: plan.currency.toLowerCase(),
  //           unit_amount: grossPaise,
  //           product_data: { name: `${env.APP_NAME} - ${plan.name}` },
  //         },
  //       },
  //     ],
  //     success_url: `${env.APP_URL}/billing?status=success`,
  //     cancel_url: `${env.APP_URL}/billing?status=cancelled`,
  //   });
  //   await prisma.payment.update({
  //     where: { id: payment.id },
  //     data: { gatewayOrderId: checkout.id },
  //   });
  //   await audit({ action: "CHECKOUT_CREATED", userId: session.user.id, ip, meta: { gateway: "STRIPE", plan: plan.code } });
  //   return json({ gateway: "STRIPE", url: checkout.url });
  // }

  // ── Razorpay (paused, kept for future re-enable) ──────────────────────────
  // if (parsed.data.gateway === "RAZORPAY") {
  //   if (!razorpayConfigured()) return badRequest("Razorpay is not configured");
  //   const order = await razorpay().orders.create({
  //     amount: grossPaise,
  //     currency: plan.currency,
  //     receipt: payment.id,
  //     notes: { paymentId: payment.id },
  //   });
  //   await prisma.payment.update({
  //     where: { id: payment.id },
  //     data: { gatewayOrderId: order.id },
  //   });
  //   await audit({ action: "CHECKOUT_CREATED", userId: session.user.id, ip, meta: { gateway: "RAZORPAY", plan: plan.code } });
  //   return json({
  //     gateway: "RAZORPAY",
  //     orderId: order.id,
  //     amount: grossPaise,
  //     currency: plan.currency,
  //     keyId: env.RAZORPAY_KEY_ID,
  //     name: `${env.APP_NAME} - ${plan.name}`,
  //     prefill: { email: session.user.email, name: session.user.name ?? "" },
  //   });
  // }

  return badRequest("Unsupported gateway");
}
