"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  code: string;
  name: string;
  interval: string;
  amountRupees: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
}

export function AdminPlans({ rows }: { rows: Plan[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((p) => (
        <PlanCard key={p.id} plan={p} />
      ))}
      {rows.length === 0 && <p className="text-sm text-muted">No plans configured.</p>}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [amount, setAmount] = useState(String(plan.amountRupees));
  const [duration, setDuration] = useState(String(plan.durationDays));
  const [active, setActive] = useState(plan.isActive);
  const [sortOrder, setSortOrder] = useState(String(plan.sortOrder));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty =
    name !== plan.name ||
    amount !== String(plan.amountRupees) ||
    duration !== String(plan.durationDays) ||
    active !== plan.isActive ||
    sortOrder !== String(plan.sortOrder);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          name,
          amountRupees: Number(amount),
          durationDays: Number(duration),
          isActive: active,
          sortOrder: Number(sortOrder),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Save failed");
      }
      setMsg({ kind: "ok", text: "Saved." });
      router.refresh();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">
          {plan.code} · {plan.interval}
        </span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Active
        </label>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹, incl. GST)">
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Duration (days)">
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Sort order">
          <input
            type="number"
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputCls + " max-w-24"}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy || !dirty}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {msg && (
          <span className={"text-sm " + (msg.kind === "ok" ? "text-pos" : "text-neg")}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
