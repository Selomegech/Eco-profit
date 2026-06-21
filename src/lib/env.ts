import { z } from "zod";

// Validate environment at module load so misconfiguration fails fast.
// Payment/email secrets are optional at boot so the app can run in a
// degraded "marketing-only" mode locally; the relevant route asserts
// presence before use via requireEnv().

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("Ecom Profit"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),

  AUTH_SECRET: z.string().min(16),

  // Google OAuth (optional). When both are set, "Continue with Google" is
  // enabled on the login/register pages. Leave unset to hide it.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // PhonePe PG. Defaults are the public UAT/sandbox credentials.
  PHONEPE_MERCHANT_ID: z.string().optional(),
  PHONEPE_SALT_KEY: z.string().optional(),
  PHONEPE_SALT_INDEX: z.string().default("1"),
  PHONEPE_HOST: z.string().default("https://api-preprod.phonepe.com/apis/pg-sandbox"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  SELLER_LEGAL_NAME: z.string().default("Ecom Profit"),
  SELLER_GSTIN: z.string().default(""),
  SELLER_STATE_CODE: z.string().default(""),
  SELLER_ADDRESS: z.string().default(""),
  SELLER_EMAIL: z.string().default(""),
  SELLER_SAC: z.string().default("998314"),
  INVOICE_PREFIX: z.string().default("EP"),
  GST_RATE: z.coerce.number().default(18),

  ADMIN_EMAILS: z.string().default(""),
  CRON_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export function requireEnv<K extends keyof typeof env>(...keys: K[]): void {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }
}

export const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Google sign-in is available only when both OAuth credentials are configured.
export const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
