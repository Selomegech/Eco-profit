"use client";

import { useState } from "react";
import { inputClass, labelClass, primaryBtn } from "@/components/AuthShell";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
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
          If an account exists for that email, we&apos;ve sent a link to reset your password. It
          expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      {error && <p className="text-sm text-neg">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
