import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { activatePaidPayment } from "@/lib/subscription";
import { emailPaymentConfirmation } from "@/lib/invoice/send";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  const raw = await req.text();

  if (!verifyWebhookSignature(raw, sig)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let payload: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    const entity = payload.payload?.payment?.entity;
    if (entity?.order_id && entity?.id) {
      try {
        const result = await activatePaidPayment({
          gatewayOrderId: entity.order_id,
          gatewayPaymentId: entity.id,
        });
        if (!result.alreadyProcessed) {
          await audit({ action: "PAYMENT_VERIFIED", meta: { gateway: "RAZORPAY", invoice: result.invoiceNumber } });
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
        console.error("razorpay activation failed", e);
        return new Response("Processing error", { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
