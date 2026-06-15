"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: string;
  email: string;
  name: string | null;
  role: string;
  verified: boolean;
  subscriptionId: string | null;
  planName: string | null;
  status: string | null;
  periodEnd: string | null;
}

type Action = "CANCEL" | "GRANT_30" | "EXPIRE";

export function AdminUsers({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(subscriptionId: string, action: Action) {
    setBusy(subscriptionId + action);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Action failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 overflow-x-auto">
      {error && <p className="mb-3 text-sm text-neg">{error}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted">
            <th className="pb-2">Email</th>
            <th className="pb-2">Role</th>
            <th className="pb-2">Plan</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Until</th>
            <th className="pb-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line align-middle">
              <td className="py-2.5">
                {r.email}
                {!r.verified && <span className="ml-2 text-xs text-accent2">unverified</span>}
              </td>
              <td className="py-2.5">{r.role}</td>
              <td className="py-2.5">{r.planName ?? "—"}</td>
              <td className="py-2.5">{r.status ?? "—"}</td>
              <td className="py-2.5 text-muted">
                {r.periodEnd ? new Date(r.periodEnd).toLocaleDateString("en-IN") : "—"}
              </td>
              <td className="py-2.5">
                {r.subscriptionId ? (
                  <div className="flex justify-end gap-1.5">
                    <ActionBtn
                      label="+30d"
                      onClick={() => act(r.subscriptionId!, "GRANT_30")}
                      busy={busy === r.subscriptionId + "GRANT_30"}
                    />
                    <ActionBtn
                      label="Cancel"
                      onClick={() => act(r.subscriptionId!, "CANCEL")}
                      busy={busy === r.subscriptionId + "CANCEL"}
                    />
                    <ActionBtn
                      label="Expire"
                      onClick={() => act(r.subscriptionId!, "EXPIRE")}
                      busy={busy === r.subscriptionId + "EXPIRE"}
                    />
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({ label, onClick, busy }: { label: string; onClick: () => void; busy: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {busy ? "…" : label}
    </button>
  );
}
