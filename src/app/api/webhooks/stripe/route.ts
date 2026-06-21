import type Stripe from "stripe";
import { env } from "@/lib/env";
import { stripe } from "@/lib/payments/stripe";
import { activatePaidPayment } from "@/lib/subscription";
import { emailPaymentConfirmation } from "@/lib/invoice/send";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Bad request", { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    // Invalid signature; reject without leaking detail.
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid" && s.id) {
      try {
        const result = await activatePaidPayment({
          gatewayOrderId: s.id,
          gatewayPaymentId: (s.payment_intent as string) ?? s.id,
        });
        if (!result.alreadyProcessed) {
          await audit({ action: "PAYMENT_VERIFIED", meta: { gateway: "STRIPE", invoice: result.invoiceNumber } });
          try {
            await emailPaymentConfirmation({
              invoiceId: result.invoiceId,
              toEmail: result.userEmail,
              planName: result.planName,
              totalPaise: result.totalPaise,
              validTill: result.validTill,
            });
          } catch (e) {
            console.error("invoice email failed", e);
          }
        }
      } catch (e) {
        console.error("stripe activation failed", e);
        return new Response("Processing error", { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
