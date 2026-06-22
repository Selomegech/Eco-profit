"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanOpt {
  id: string;
  name: string;
  price: string;
  durationDays: number;
}

interface Sub {
  id: string;
  planName: string;
  status: string;
  periodEnd: string | null;
}

export function AdminUserActions({
  userId,
  emailVerified,
  hasPassword,
  plans,
  subscriptions,
}: {
  userId: string;
  emailVerified: boolean;
  hasPassword: boolean;
  plans: PlanOpt[];
  subscriptions: Sub[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");

  async function call(key: string, url: string, body: Record<string, unknown>, okText: string) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Action failed");
      }
      setMsg({ kind: "ok", text: okText });
      router.refresh();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBusy(null);
    }
  }

  const subAction = (subscriptionId: string, action: string, ok: string) =>
    call(subscriptionId + action, "/api/admin/subscription", { subscriptionId, action }, ok);

  const userAction = (action: string, ok: string) =>
    call(action, "/api/admin/user", { userId, action }, ok);

  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
      <h2 className="font-serif text-lg font-semibold">Actions</h2>

      {msg && (
        <p className={"mt-3 text-sm " + (msg.kind === "ok" ? "text-pos" : "text-neg")}>{msg.text}</p>
      )}

      {/* Email / account actions */}
      <div className="mt-4 space-y-2">
        {!emailVerified && (
          <Btn
            label="Resend verification email"
            busy={busy === "RESEND_VERIFICATION"}
            onClick={() => userAction("RESEND_VERIFICATION", "Verification email sent.")}
          />
        )}
        {!emailVerified && (
          <Btn
            label="Mark email verified"
            busy={busy === "VERIFY_EMAIL"}
            onClick={() => userAction("VERIFY_EMAIL", "Email marked verified.")}
          />
        )}
        {hasPassword && (
          <Btn
            label="Send password reset email"
            busy={busy === "SEND_PASSWORD_RESET"}
            onClick={() => userAction("SEND_PASSWORD_RESET", "Password reset email sent.")}
          />
        )}
      </div>

      {/* Grant a plan */}
      {plans.length > 0 && (
        <div className="mt-5 border-t border-line pt-5">
          <div className="text-xs uppercase tracking-wider text-muted">Grant a plan</div>
          <div className="mt-2 flex gap-2">
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price} ({p.durationDays}d)
                </option>
              ))}
            </select>
            <Btn
              label="Grant"
              compact
              busy={busy === "GRANT_PLAN"}
              onClick={() =>
                call(
                  "GRANT_PLAN",
                  "/api/admin/subscription",
                  { action: "GRANT_PLAN", userId, planId },
                  "Plan granted.",
                )
              }
            />
          </div>
        </div>
      )}

      {/* Existing subscriptions */}
      <div className="mt-5 border-t border-line pt-5">
        <div className="text-xs uppercase tracking-wider text-muted">Subscriptions</div>
        {subscriptions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {subscriptions.map((s) => (
              <li key={s.id} className="rounded-lg border border-line p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.planName}</span>
                  <span className="text-muted">{s.status}</span>
                </div>
                <div className="text-xs text-muted">
                  {s.periodEnd
                    ? "Until " + new Date(s.periodEnd).toLocaleDateString("en-IN")
                    : "No period set"}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Btn
                    label="+30d"
                    compact
                    busy={busy === s.id + "GRANT_30"}
                    onClick={() => subAction(s.id, "GRANT_30", "Extended 30 days.")}
                  />
                  <Btn
                    label="Cancel"
                    compact
                    busy={busy === s.id + "CANCEL"}
                    onClick={() => subAction(s.id, "CANCEL", "Subscription cancelled.")}
                  />
                  <Btn
                    label="Expire"
                    compact
                    busy={busy === s.id + "EXPIRE"}
                    onClick={() => subAction(s.id, "EXPIRE", "Subscription expired.")}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Btn({
  label,
  onClick,
  busy,
  compact,
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={
        "rounded-lg border border-line font-medium hover:border-accent hover:text-accent disabled:opacity-50 " +
        (compact ? "px-2.5 py-1 text-xs" : "w-full px-3 py-2 text-sm")
      }
    >
      {busy ? "…" : label}
    </button>
  );
}
