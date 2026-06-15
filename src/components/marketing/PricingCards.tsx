import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { paiseToInr } from "@/lib/money";

const perks = [
  "Unlimited Meesho & Flipkart uploads",
  "Settlement reconciliation & ageing",
  "SKU-level profit & loss",
  "Excel & PDF report exports",
  "GST-ready summaries",
  "Data stays in your browser",
];

// `ctaHref` lets the same cards point to /register on the landing page and to
// /billing for logged-in users.
export function PricingCards({ ctaHref = "/register" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => {
        const monthlyEq = Math.round(plan.amountPaise / (plan.durationDays / 30));
        return (
          <div
            key={plan.code}
            className={`relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm ${
              plan.highlight ? "border-accent ring-1 ring-accent" : "border-line"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Most popular
              </span>
            )}
            <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-serif text-4xl font-black">{paiseToInr(plan.amountPaise)}</span>
              <span className="text-sm text-muted">
                /{plan.interval === "MONTHLY" ? "mo" : plan.interval === "QUARTERLY" ? "quarter" : "yr"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              ≈ {paiseToInr(monthlyEq)}/month · incl. GST
            </p>
            <Link
              href={`${ctaHref}?plan=${plan.code}`}
              className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                plan.highlight
                  ? "bg-accent text-white hover:bg-accent-dark"
                  : "border border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              Choose {plan.name}
            </Link>
            <ul className="mt-6 space-y-2.5 text-sm">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span className="text-ink/80">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
