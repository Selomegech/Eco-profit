import { Suspense } from "react";
import { requireUser, getSubscriptionState } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { PLANS, intervalMonths } from "@/lib/plans";
import { BillingClient } from "./BillingClient";
import { CancelSubscription } from "./CancelSubscription";

export const metadata = { title: "Billing - Ecom Profit" };

// Cadence note shown under the per-month figure, mirroring the landing page
// pricing cards. Prices are GST-exclusive.
function billingNote(interval: string, amountPaise: number): string {
  const total = paiseToInr(amountPaise);
  switch (interval) {
    case "HALFYEARLY":
      return `${total} every 6 months · + 18% GST`;
    case "ANNUAL":
      return `${total} per year · + 18% GST`;
    default:
      return `billed monthly · + 18% GST`;
  }
}

export default async function BillingPage() {
  const user = await requireUser();
  const [{ sub, isActive }, invoices] = await Promise.all([
    getSubscriptionState(user.id),
    prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const plans = PLANS.map((p) => ({
    code: p.code,
    name: p.name,
    perMonth: Math.round(p.amountPaise / intervalMonths(p.interval) / 100),
    note: billingNote(p.interval, p.amountPaise),
    interval: p.interval,
    highlight: !!p.highlight,
    blurb: p.blurb,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-black">Billing</h1>
        <p className="mt-1 text-muted">Choose a plan and pay securely with PhonePe (UPI, cards or netbanking).</p>
      </div>

      {isActive && sub && (
        <div className="rounded-xl border border-pos/30 bg-pos/5 p-4 text-sm">
          {sub.cancelledAt ? (
            <>
              Your <b>{sub.plan.name}</b> plan is <b>cancelled</b> and won&apos;t renew. You keep full
              access until <b>{sub.currentPeriodEnd?.toLocaleDateString("en-IN")}</b>. Buying again
              reactivates and extends your access.
            </>
          ) : (
            <>
              You&apos;re on the <b>{sub.plan.name}</b> plan, active until{" "}
              <b>{sub.currentPeriodEnd?.toLocaleDateString("en-IN")}</b>. Buying again extends your access.
              <CancelSubscription
                periodEnd={sub.currentPeriodEnd?.toLocaleDateString("en-IN") ?? ""}
              />
            </>
          )}
        </div>
      )}

      <Suspense>
        <BillingClient plans={plans} />
      </Suspense>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No invoices yet.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2">Invoice</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-line">
                  <td className="py-2.5 font-mono text-xs">{inv.number}</td>
                  <td className="py-2.5">{inv.issuedAt.toLocaleDateString("en-IN")}</td>
                  <td className="py-2.5 text-right">{paiseToInr(inv.totalPaise)}</td>
                  <td className="py-2.5 text-right">
                    <a
                      href={`/api/invoices/${inv.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-accent hover:underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
