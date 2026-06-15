import Stripe from "stripe";
import { env, requireEnv } from "@/lib/env";

let client: Stripe | null = null;

export function stripe(): Stripe {
  requireEnv("STRIPE_SECRET_KEY");
  if (!client) {
    // Pin via dashboard default API version; omit here to avoid SDK literal drift.
    client = new Stripe(env.STRIPE_SECRET_KEY!);
  }
  return client;
}

export function stripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET;
}
