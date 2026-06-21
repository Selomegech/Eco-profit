"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close the modal on Escape for keyboard users.
  useEffect(() => {
    if (!confirming) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) setConfirming(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, loading]);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
      >
        Log out
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => !loading && setConfirming(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* dialog */}
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-xl">
            <h2 id="logout-title" className="font-serif text-lg font-semibold">
              Log out?
            </h2>
            <p className="mt-2 text-sm text-muted">
              You&apos;ll need to sign in again to access your dashboard.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold transition hover:bg-ink/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  signOut({ callbackUrl: "/" });
                }}
                disabled={loading}
                className="rounded-lg bg-neg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
