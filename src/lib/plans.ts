import type { BillingInterval } from "@prisma/client";

// Catalog source of truth. Seeded into the Plan table via `npm run db:seed`.
// Prices are GST-EXCLUSIVE base amounts, in paise. 18% GST is added on top at
// checkout; these are the figures we display (without tax) to the customer.
export interface PlanSeed {
  code: string;
  name: string;
  interval: BillingInterval;
  amountPaise: number;
  durationDays: number;
  sortOrder: number;
  blurb: string;
  highlight?: boolean;
}

export const PLANS: PlanSeed[] = [
  {
    code: "monthly",
    name: "Monthly",
    interval: "MONTHLY",
    amountPaise: 99900, // ₹999 / month (base, +18% GST at checkout)
    durationDays: 30,
    sortOrder: 1,
    blurb: "Full access, billed every month.",
  },
  {
    code: "semiannual",
    name: "Semi-annual",
    interval: "HALFYEARLY",
    amountPaise: 449400, // ₹4,494 every 6 months = ₹749/mo (base, +18% GST)
    durationDays: 182,
    sortOrder: 2,
    blurb: "Save 25% versus monthly.",
  },
  {
    code: "annual",
    name: "Annual",
    interval: "ANNUAL",
    amountPaise: 718800, // ₹7,188 / year = ₹599/mo (base, +18% GST)
    durationDays: 365,
    sortOrder: 3,
    blurb: "Save 40% versus monthly.",
    highlight: true,
  },
];

// Display months per interval, used to show the effective per-month price.
export function intervalMonths(interval: BillingInterval): number {
  switch (interval) {
    case "MONTHLY":
      return 1;
    case "QUARTERLY":
      return 3;
    case "HALFYEARLY":
      return 6;
    case "ANNUAL":
      return 12;
  }
}

export function planByCode(code: string): PlanSeed | undefined {
  return PLANS.find((p) => p.code === code);
}
