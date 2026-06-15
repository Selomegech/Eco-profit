"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
    >
      Log out
    </button>
  );
}
