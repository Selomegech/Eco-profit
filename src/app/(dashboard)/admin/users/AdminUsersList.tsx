"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Row {
  id: string;
  email: string;
  name: string | null;
  role: string;
  verified: boolean;
  planName: string | null;
  status: string | null;
  createdAt: string;
}

export function AdminUsersList({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(needle) ||
        (r.name?.toLowerCase().includes(needle) ?? false),
    );
  }, [q, rows]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or name…"
          className="w-full max-w-xs rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <span className="text-sm text-muted">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted">
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Plan</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-line align-middle">
                <td className="py-2.5">
                  <Link href={`/admin/users/${r.id}`} className="font-medium hover:text-accent">
                    {r.email}
                  </Link>
                  {r.name && <span className="ml-2 text-xs text-muted">{r.name}</span>}
                  {!r.verified && <span className="ml-2 text-xs text-accent2">unverified</span>}
                </td>
                <td className="py-2.5">{r.role}</td>
                <td className="py-2.5">{r.planName ?? "-"}</td>
                <td className="py-2.5">{r.status ?? "-"}</td>
                <td className="py-2.5 text-right text-muted">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted">
                  No users match “{q}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
