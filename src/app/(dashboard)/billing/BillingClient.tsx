"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Only PhonePe is active. Stripe and Razorpay are paused but their handling is
// kept (commented) below so they can be switched back on later.
type Gateway = "PHONEPE";

interface PlanView {
  code: string;
  name: string;
  price: string;
  interval: string;
  highlight: boolean;
  blurb: string;
}

export function BillingClient({ plans }: { plans: PlanView[] }) {
  const params = useSearchParams();
  const preselect = params.get("plan");
  const status = params.get("status");

  const [selected, setSelected] = useState(preselect ?? plans.find((p) => p.highlight)?.code ?? plans[0]?.code);
  const gateway: Gateway = "PHONEPE";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselect) setSelected(preselect);
  }, [preselect]);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: selected, gateway }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");

      // PhonePe: redirect the buyer to the hosted payment page.
      if (data.gateway === "PHONEPE" && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Unexpected checkout response");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
      {status === "success" && (
        <p className="mb-4 rounded-lg bg-pos/10 px-3 py-2 text-sm text-pos">
          Payment received. Your subscription will activate momentarily.
        </p>
      )}
      {status === "cancelled" && (
        <p className="mb-4 rounded-lg bg-neg/10 px-3 py-2 text-sm text-neg">
          Checkout was cancelled or not completed. You can try again any time.
        </p>
      )}

      <h2 className="font-serif text-xl font-semibold">Choose a plan</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => setSelected(p.code)}
            className={`rounded-xl border p-4 text-left transition ${
              selected === p.code ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-accent/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{p.name}</span>
              {p.highlight && <span className="text-xs font-semibold text-accent">Popular</span>}
            </div>
            <div className="mt-1 font-serif text-2xl font-black">{p.price}</div>
            <div className="mt-1 text-xs text-muted">{p.blurb}</div>
          </button>
        ))}
      </div>

      <h2 className="mt-6 font-serif text-xl font-semibold">Payment method</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <div className="rounded-lg border border-accent bg-accent/5 px-5 py-2.5 text-sm font-semibold text-accent">
          PhonePe (UPI / Cards / Netbanking)
        </div>
        {/* Stripe and Razorpay are paused. To re-enable, restore the gateway
            selector here and the matching branches in /api/checkout. */}
      </div>

      {error && <p className="mt-4 text-sm text-neg">{error}</p>}

      <button
        onClick={startCheckout}
        disabled={loading || !selected}
        className="mt-6 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Redirecting to PhonePe…" : "Proceed to payment"}
      </button>
      <p className="mt-3 text-xs text-muted">
        Prices shown are exclusive of tax. 18% GST is added at checkout and you&apos;ll receive a
        GST invoice by email after a successful payment.
      </p>
    </div>
  );
}
