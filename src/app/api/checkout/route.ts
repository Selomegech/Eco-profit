import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { stripe, stripeConfigured } from "@/lib/payments/stripe";
import { razorpay, razorpayConfigured } from "@/lib/payments/razorpay";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, unauthorized, tooMany } from "@/lib/http";

const schema = z.object({
  planCode: z.string().min(1),
  gateway: z.enum(["STRIPE", "RAZORPAY"]),
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

  if (parsed.data.gateway === "STRIPE") {
    if (!stripeConfigured()) return badRequest("Stripe is not configured");
    const checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      client_reference_id: payment.id,
      metadata: { paymentId: payment.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: plan.amountPaise,
            product_data: { name: `${env.APP_NAME} — ${plan.name}` },
          },
        },
      ],
      success_url: `${env.APP_URL}/billing?status=success`,
      cancel_url: `${env.APP_URL}/billing?status=cancelled`,
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: checkout.id },
    });
    await audit({ action: "CHECKOUT_CREATED", userId: session.user.id, ip, meta: { gateway: "STRIPE", plan: plan.code } });
    return json({ gateway: "STRIPE", url: checkout.url });
  }

  // Razorpay
  if (!razorpayConfigured()) return badRequest("Razorpay is not configured");
  const order = await razorpay().orders.create({
    amount: plan.amountPaise,
    currency: plan.currency,
    receipt: payment.id,
    notes: { paymentId: payment.id },
  });
  await prisma.payment.update({
    where: { id: payment.id },
    data: { gatewayOrderId: order.id },
  });
  await audit({ action: "CHECKOUT_CREATED", userId: session.user.id, ip, meta: { gateway: "RAZORPAY", plan: plan.code } });
  return json({
    gateway: "RAZORPAY",
    orderId: order.id,
    amount: plan.amountPaise,
    currency: plan.currency,
    keyId: env.RAZORPAY_KEY_ID,
    name: `${env.APP_NAME} — ${plan.name}`,
    prefill: { email: session.user.email, name: session.user.name ?? "" },
  });
}
