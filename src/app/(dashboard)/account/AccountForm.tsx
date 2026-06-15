"use client";

import { useState } from "react";
import { GST_STATES } from "@/lib/gst-states";
import { inputClass, labelClass } from "@/components/AuthShell";

interface Initial {
  billingName: string;
  gstin: string;
  stateCode: string;
  billingAddress: string;
}

export function AccountForm({ initial }: { initial: Initial }) {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      setMsg({ ok: true, text: "Saved." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="billingName">Billing name (business)</label>
        <input
          id="billingName"
          className={inputClass}
          value={state.billingName}
          onChange={(e) => setState({ ...state, billingName: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="gstin">GSTIN</label>
          <input
            id="gstin"
            className={`${inputClass} font-mono uppercase`}
            placeholder="29ABCDE1234F1Z5"
            value={state.gstin}
            onChange={(e) => setState({ ...state, gstin: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="stateCode">State (place of supply)</label>
          <select
            id="stateCode"
            className={inputClass}
            value={state.stateCode}
            onChange={(e) => setState({ ...state, stateCode: e.target.value })}
          >
            <option value="">Select state…</option>
            {GST_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="billingAddress">Billing address</label>
        <textarea
          id="billingAddress"
          rows={3}
          className={inputClass}
          value={state.billingAddress}
          onChange={(e) => setState({ ...state, billingAddress: e.target.value })}
        />
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-pos" : "text-neg"}`}>{msg.text}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
