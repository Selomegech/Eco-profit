import type { BillingInterval } from "@prisma/client";

// Catalog source of truth. Seeded into the Plan table via `npm run db:seed`.
// Prices are GST-INCLUSIVE, in paise.
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
    amountPaise: 49900, // ₹499
    durationDays: 30,
    sortOrder: 1,
    blurb: "Best for trying things out.",
  },
  {
    code: "quarterly",
    name: "Quarterly",
    interval: "QUARTERLY",
    amountPaise: 129900, // ₹1,299 (~13% off)
    durationDays: 91,
    sortOrder: 2,
    blurb: "Save vs monthly. Most popular.",
    highlight: true,
  },
  {
    code: "annual",
    name: "Annual",
    interval: "ANNUAL",
    amountPaise: 449900, // ₹4,499 (~25% off)
    durationDays: 365,
    sortOrder: 3,
    blurb: "Best value for full-time sellers.",
  },
];

export function planByCode(code: string): PlanSeed | undefined {
  return PLANS.find((p) => p.code === code);
}
