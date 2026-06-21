"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSubscription({ periodEnd }: { periodEnd: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not cancel subscription");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-3 text-xs font-semibold text-muted underline hover:text-neg"
      >
        Cancel subscription
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-neg/30 bg-neg/5 p-3 text-xs">
      <p className="text-foreground">
        Cancel your subscription? You&apos;ll keep full access until{" "}
        <b>{periodEnd}</b>. We just won&apos;t renew after that.
      </p>
      {error && <p className="mt-2 text-neg">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={loading}
          className="rounded-md bg-neg px-3 py-1.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-md border border-line px-3 py-1.5 font-semibold transition hover:bg-card disabled:opacity-50"
        >
          Keep my plan
        </button>
      </div>
    </div>
  );
}
