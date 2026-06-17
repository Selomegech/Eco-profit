"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={() => {
        setLoading(true);
        signOut({ callbackUrl: "/" });
      }}
      disabled={loading}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-ink/5 disabled:opacity-50"
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
