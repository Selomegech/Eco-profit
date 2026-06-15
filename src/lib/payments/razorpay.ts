import crypto from "crypto";
import Razorpay from "razorpay";
import { env, requireEnv } from "@/lib/env";

let client: Razorpay | null = null;

export function razorpay(): Razorpay {
  requireEnv("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET");
  if (!client) {
    client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

export function razorpayConfigured(): boolean {
  return !!env.RAZORPAY_KEY_ID && !!env.RAZORPAY_KEY_SECRET;
}

// Verify the checkout callback signature: HMAC_SHA256(order_id|payment_id).
export function verifyCheckoutSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, opts.signature);
}

// Verify a webhook payload signature against RAZORPAY_WEBHOOK_SECRET.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}
