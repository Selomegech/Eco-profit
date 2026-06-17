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
    amountPaise: 150000, // ₹1,500 / month (base, +18% GST at checkout)
    durationDays: 30,
    sortOrder: 1,
    blurb: "Billed every month.",
  },
  {
    code: "semiannual",
    name: "Semi-annual",
    interval: "HALFYEARLY",
    amountPaise: 600000, // ₹6,000 every 6 months = ₹1,000/mo (base, +18% GST)
    durationDays: 182,
    sortOrder: 2,
    blurb: "₹1,000/month, billed every 6 months.",
    highlight: true,
  },
  {
    code: "annual",
    name: "Annual",
    interval: "ANNUAL",
    amountPaise: 900000, // ₹9,000 / year = ₹750/mo (base, +18% GST)
    durationDays: 365,
    sortOrder: 3,
    blurb: "₹750/month, billed annually.",
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
