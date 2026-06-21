import { requireUser, getSubscriptionState } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { PendingLink } from "@/components/app/PendingLink";

export const metadata = { title: "Dashboard - Ecom Profit" };

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
      }`}
    >
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const { sub, isActive } = await getSubscriptionState(user.id);

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-black">
          Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted">Here&apos;s the status of your subscription.</p>
      </div>

      {/* Subscription card */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">Subscription</h2>
          {sub ? (
            <StatusBadge active={isActive} label={isActive ? "Active" : sub.status} />
          ) : (
            <StatusBadge active={false} label="No plan" />
          )}
        </div>

        {sub && isActive ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Plan" value={sub.plan.name} />
            <Field label="Price" value={`${paiseToInr(sub.plan.amountPaise)} + GST`} />
            <Field
              label="Renews / expires"
              value={sub.currentPeriodEnd?.toLocaleDateString("en-IN") ?? "-"}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            {sub
              ? "Your subscription isn't active. You can still explore the demo with sample data. Renew to upload and analyse your own Flipkart & Meesho files."
              : "You don't have a subscription yet. Try the demo with sample data, then choose a plan to upload and analyse your own Flipkart & Meesho files."}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {isActive ? (
            <>
              <PendingLink
                href="/app"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-dark"
              >
                Open the app
              </PendingLink>
              <PendingLink
                href="/billing"
                className="rounded-lg border border-ink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper"
              >
                Manage billing
              </PendingLink>
            </>
          ) : (
            <>
              <PendingLink
                href="/app"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-dark"
              >
                Open the demo
              </PendingLink>
              <PendingLink
                href="/billing"
                className="rounded-lg border border-ink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper"
              >
                {sub ? "Renew now" : "Choose a plan"}
              </PendingLink>
            </>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold">Recent invoices</h2>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
