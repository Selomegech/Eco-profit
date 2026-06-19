import Link from "next/link";
import { PLANS, intervalMonths } from "@/lib/plans";
import { paiseToInr } from "@/lib/money";

// Billing-cadence note shown under the price (the big figure is always the
// effective per-month price; prices are GST-exclusive).
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

// Per-plan feature bullets (client-supplied copy).
const perksByCode: Record<string, string[]> = {
  monthly: [
    "Flipkart & Meesho support",
    "SKU-level P&L",
    "Settlement reconciliation",
    "PDF & Excel reports",
  ],
  semiannual: [
    "Everything in Monthly",
    "Returns & cost analysis",
    "Profit insights",
    "Priority email support",
  ],
  annual: [
    "Everything in 6 Months",
    "Best price per month",
    "All future updates",
    "Priority support",
  ],
};

const defaultPerks = [
  "Flipkart & Meesho support",
  "SKU-level P&L",
  "Settlement reconciliation",
  "Excel & PDF reports",
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2 18.6 6.8z" />
  </svg>
);

// `ctaHref` lets the same cards point to /register on the landing page and to
// /billing for logged-in users.
export function PricingCards({ ctaHref = "/register" }: { ctaHref?: string }) {
  return (
    <div className="price-grid">
      {PLANS.map((plan) => {
        const perMonthRupees = Math.round(plan.amountPaise / intervalMonths(plan.interval) / 100);
        const perks = perksByCode[plan.code] ?? defaultPerks;
        return (
          <div key={plan.code} className={`plan${plan.highlight ? " pop" : ""}`}>
            {plan.highlight && <div className="badge">Best value</div>}
            <div className="pn">{plan.name}</div>
            <div className="pd">{plan.blurb}</div>
            <div className="pp">
              <span className="cur">₹</span>
              <span className="amt">{perMonthRupees.toLocaleString("en-IN")}</span>
              <span className="per">/mo</span>
            </div>
            <div className="pp2">{billingNote(plan.interval, plan.amountPaise)}</div>
            <ul>
              {perks.map((p) => (
                <li key={p}>
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={`${ctaHref}?plan=${plan.code}`}
              className={`btn btn-sm ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
            >
              Get started
            </Link>
          </div>
        );
      })}
    </div>
  );
}
