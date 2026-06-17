import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { checkStatus, verifyCallbackChecksum } from "@/lib/payments/phonepe";
import { activatePaidPayment } from "@/lib/subscription";
import { emailPaymentConfirmation } from "@/lib/invoice/send";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Activate the subscription for a completed PhonePe transaction. Always
// re-checks status server-side (source of truth) and is idempotent, so both
// the browser redirect (GET) and the S2S callback (POST) can safely call it.
async function settle(merchantTransactionId: string): Promise<boolean> {
  const status = await checkStatus(merchantTransactionId);
  if (!status.success) return false;

  const result = await activatePaidPayment({
    gatewayOrderId: merchantTransactionId,
    gatewayPaymentId: status.transactionId ?? merchantTransactionId,
  });

  if (!result.alreadyProcessed) {
    await audit({ action: "PAYMENT_VERIFIED", meta: { gateway: "PHONEPE", invoice: result.invoiceNumber } });
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
  return true;
}

// Browser redirect back from PhonePe's hosted page.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.redirect(`${env.APP_URL}/billing?status=cancelled`);

  let ok = false;
  try {
    ok = await settle(id);
  } catch (e) {
    console.error("phonepe settle (GET) failed", e);
  }
  return NextResponse.redirect(`${env.APP_URL}/billing?status=${ok ? "success" : "cancelled"}`);
}

// Server-to-server callback. PhonePe POSTs { response: <base64> } with an
// X-VERIFY header we must validate before trusting it.
export async function POST(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const xVerify = req.headers.get("x-verify") ?? "";
  const raw = await req.text();

  let base64 = "";
  try {
    base64 = (JSON.parse(raw) as { response?: string }).response ?? "";
  } catch {
    base64 = "";
  }

  if (!base64 || !verifyCallbackChecksum(base64, xVerify)) {
    return new Response("Invalid signature", { status: 400 });
  }

  // Resolve the transaction id from the callback payload, falling back to ?id=.
  let txnId = id ?? "";
  try {
    const decoded = JSON.parse(Buffer.from(base64, "base64").toString("utf8")) as {
      data?: { merchantTransactionId?: string };
    };
    txnId = decoded.data?.merchantTransactionId ?? txnId;
  } catch {
    /* fall back to ?id= */
  }
  if (!txnId) return new Response("Bad payload", { status: 400 });

  try {
    await settle(txnId);
  } catch (e) {
    console.error("phonepe settle (POST) failed", e);
    return new Response("Processing error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}
