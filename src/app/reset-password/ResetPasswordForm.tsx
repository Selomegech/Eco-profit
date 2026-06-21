"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { inputClass, labelClass, primaryBtn } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg border border-neg/30 bg-neg/5 p-4 text-sm">
        <p className="font-semibold text-neg">Invalid link</p>
        <p className="mt-1 text-muted">
          This reset link is missing or malformed.{" "}
          <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="password">New password</label>
        <PasswordInput id="password" required autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">At least 10 characters, with upper, lower and a number.</p>
      </div>
      {error && <p className="text-sm text-neg">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
