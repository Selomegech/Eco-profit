"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { inputClass, labelClass, primaryBtn } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");
  const verified = params.get("verified");
  const reset = params.get("reset");
  const callbackUrl = params.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (!res || res.error) {
      setLoading(false);
      setError("Invalid email or password, or your email isn't verified yet.");
      return;
    }
    // Keep the button in its loading state through navigation; the dashboard
    // route's loading.tsx then takes over until the page is ready.
    // Admins skip the user dashboard and land on the admin panel. An explicit
    // plan or callbackUrl (e.g. a deep link they were bounced from) still wins.
    const session = await getSession();
    const isAdmin = session?.user?.role === "ADMIN";
    const dest = plan
      ? `/billing?plan=${plan}`
      : callbackUrl || (isAdmin ? "/admin" : "/dashboard");
    router.push(dest);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {verified === "1" && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
          Email verified. You can log in now.
        </p>
      )}
      {verified === "invalid" && (
        <p className="rounded-lg bg-neg/10 px-3 py-2 text-xs text-neg">
          That verification link is invalid or expired.
        </p>
      )}
      {reset === "1" && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
          Password reset. Log in with your new password.
        </p>
      )}
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass} htmlFor="password">Password</label>
          <Link
            href="/forgot-password"
            className="mb-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="password" required autoComplete="current-password" />
      </div>
      {error && <p className="text-sm text-neg">{error}</p>}
      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
