"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { inputClass, labelClass, primaryBtn } from "@/components/AuthShell";

export function RegisterForm() {
  const params = useSearchParams();
  const plan = params.get("plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-accent">Check your inbox</p>
        <p className="mt-1 text-muted">
          We&apos;ve sent a verification link to your email. Confirm it, then log in to choose a plan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {plan && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
          You selected the <b>{plan}</b> plan. Finish signup to continue to payment.
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="name">Full name</label>
        <input id="name" name="name" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
        <p className="mt-1 text-xs text-muted">At least 10 characters, with upper, lower and a number.</p>
      </div>
      {error && <p className="text-sm text-neg">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-xs text-muted">
        By signing up you agree to our{" "}
        <a href="/terms" className="underline">Terms</a> and{" "}
        <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
