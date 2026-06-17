import crypto from "crypto";
import { env } from "@/lib/env";

// PhonePe PG (v1 hosted "PAY_PAGE") integration.
// Sandbox defaults: merchantId PGTESTPAYUAT, the public UAT salt key,
// saltIndex 1, host https://api-preprod.phonepe.com/apis/pg-sandbox.

const PAY_PATH = "/pg/v1/pay";

function merchantId(): string {
  return env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
}

function saltKey(): string {
  return env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
}

function saltIndex(): string {
  return env.PHONEPE_SALT_INDEX || "1";
}

export function phonepeConfigured(): boolean {
  // The public sandbox creds always work; in production the client supplies
  // their own merchantId + salt. Either way we can initiate a payment.
  return true;
}

// X-VERIFY = sha256(payload + path + saltKey) + "###" + saltIndex
function sign(payloadAndPath: string): string {
  const hash = crypto.createHash("sha256").update(payloadAndPath + saltKey()).digest("hex");
  return `${hash}###${saltIndex()}`;
}

export interface PhonePeInitResult {
  redirectUrl: string;
  merchantTransactionId: string;
}

// Initiate a hosted checkout. Returns the URL to redirect the buyer to.
export async function initiatePay(opts: {
  merchantTransactionId: string; // our payment.id
  merchantUserId: string;
  amountPaise: number; // GST-inclusive total, in paise
  redirectUrl: string; // where PhonePe sends the user back (GET)
  callbackUrl: string; // server-to-server status callback (POST)
  mobileNumber?: string;
}): Promise<PhonePeInitResult> {
  const payload = {
    merchantId: merchantId(),
    merchantTransactionId: opts.merchantTransactionId,
    merchantUserId: opts.merchantUserId,
    amount: opts.amountPaise,
    redirectUrl: opts.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: opts.callbackUrl,
    ...(opts.mobileNumber ? { mobileNumber: opts.mobileNumber } : {}),
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const xVerify = sign(base64 + PAY_PATH);

  const res = await fetch(`${env.PHONEPE_HOST}${PAY_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-VERIFY": xVerify,
    },
    body: JSON.stringify({ request: base64 }),
  });

  const data = (await res.json().catch(() => null)) as {
    success?: boolean;
    code?: string;
    message?: string;
    data?: { instrumentResponse?: { redirectInfo?: { url?: string } } };
  } | null;

  const url = data?.data?.instrumentResponse?.redirectInfo?.url;
  if (!res.ok || !data?.success || !url) {
    throw new Error(`PhonePe initiate failed: ${data?.code ?? res.status} ${data?.message ?? ""}`.trim());
  }

  return { redirectUrl: url, merchantTransactionId: opts.merchantTransactionId };
}

export interface PhonePeStatus {
  state: string; // COMPLETED | FAILED | PENDING
  success: boolean;
  transactionId?: string; // PhonePe's own txn id
}

// Server-side status check (source of truth before activating a subscription).
export async function checkStatus(merchantTransactionId: string): Promise<PhonePeStatus> {
  const path = `/pg/v1/status/${merchantId()}/${merchantTransactionId}`;
  const xVerify = sign(path);

  const res = await fetch(`${env.PHONEPE_HOST}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-VERIFY": xVerify,
      "X-MERCHANT-ID": merchantId(),
    },
  });

  const data = (await res.json().catch(() => null)) as {
    success?: boolean;
    code?: string;
    data?: { state?: string; transactionId?: string };
  } | null;

  const state = data?.data?.state ?? "FAILED";
  return {
    state,
    success: !!data?.success && state === "COMPLETED",
    transactionId: data?.data?.transactionId,
  };
}

// Verify the X-VERIFY header PhonePe sends on the server callback:
// sha256(base64Response + saltKey) + "###" + saltIndex
export function verifyCallbackChecksum(base64Response: string, header: string): boolean {
  const expected = sign(base64Response);
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
