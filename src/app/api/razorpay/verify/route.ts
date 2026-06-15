import { z } from "zod";
import { auth } from "@/auth";
import { verifyCheckoutSignature } from "@/lib/payments/razorpay";
import { activatePaidPayment } from "@/lib/subscription";
import { emailPaymentConfirmation } from "@/lib/invoice/send";
import { audit } from "@/lib/audit";
import { sameOrigin, json, badRequest, unauthorized } from "@/lib/http";

export const runtime = "nodejs";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Client-side callback after Razorpay checkout. The webhook is the source of
// truth, but verifying here gives the user instant activation. Both paths are
// idempotent.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return badRequest("Bad origin");
  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid input");

  const ok = verifyCheckoutSignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });
  if (!ok) return badRequest("Signature verification failed");

  const result = await activatePaidPayment({
    gatewayOrderId: parsed.data.razorpay_order_id,
    gatewayPaymentId: parsed.data.razorpay_payment_id,
    gatewaySignature: parsed.data.razorpay_signature,
  });

  if (!result.alreadyProcessed) {
    await audit({ action: "PAYMENT_VERIFIED", userId: session.user.id, meta: { gateway: "RAZORPAY", invoice: result.invoiceNumber } });
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

  return json({ ok: true });
}
