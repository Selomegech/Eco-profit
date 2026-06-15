"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Gateway = "STRIPE" | "RAZORPAY";

interface PlanView {
  code: string;
  name: string;
  price: string;
  interval: string;
  highlight: boolean;
  blurb: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    // Under our strict-dynamic CSP, a script injected by this trusted (nonce'd)
    // bundle is allowed to load.
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function BillingClient({ plans }: { plans: PlanView[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const preselect = params.get("plan");
  const status = params.get("status");

  const [selected, setSelected] = useState(preselect ?? plans.find((p) => p.highlight)?.code ?? plans[0]?.code);
  const [gateway, setGateway] = useState<Gateway>("RAZORPAY");
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

      if (data.gateway === "STRIPE") {
        window.location.href = data.url;
        return;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Couldn't load Razorpay");
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        prefill: data.prefill,
        theme: { color: "#0f5c4d" },
        handler: async (resp: Record<string, string>) => {
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (verify.ok) {
            router.push("/dashboard");
            router.refresh();
          } else {
            setError("Payment verification failed. If you were charged, contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
          Checkout was cancelled. You can try again any time.
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
        {(["RAZORPAY", "STRIPE"] as Gateway[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGateway(g)}
            className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
              gateway === g ? "border-accent bg-accent/5 text-accent" : "border-line text-ink/80 hover:border-accent/50"
            }`}
          >
            {g === "RAZORPAY" ? "Razorpay (UPI / Cards / Netbanking)" : "Stripe (International cards)"}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-neg">{error}</p>}

      <button
        onClick={startCheckout}
        disabled={loading || !selected}
        className="mt-6 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Starting checkout…" : "Proceed to payment"}
      </button>
      <p className="mt-3 text-xs text-muted">
        You&apos;ll receive a GST invoice by email after a successful payment. Prices are inclusive of GST.
      </p>
    </div>
  );
}
