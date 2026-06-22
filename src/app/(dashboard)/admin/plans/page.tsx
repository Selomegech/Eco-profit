import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "../AdminNav";
import { AdminPlans } from "./AdminPlans";

export const metadata = { title: "Plans - Admin" };

export default async function AdminPlansPage() {
  await requireAdmin();

  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });

  const rows = plans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    interval: p.interval,
    amountRupees: Math.round(p.amountPaise / 100),
    durationDays: p.durationDays,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-black">Plans</h1>
        <AdminNav />
      </div>
      <p className="-mt-4 text-sm text-muted">
        Prices are GST-inclusive in whole rupees, as charged to the customer. Changes apply to new
        checkouts only; existing subscriptions are unaffected.
      </p>
      <AdminPlans rows={rows} />
    </div>
  );
}
