import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { AdminNav } from "../../AdminNav";
import { AdminUserActions } from "./AdminUserActions";

export const metadata = { title: "User - Admin" };

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [user, plans] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: { plan: { select: { name: true } } },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { invoice: { select: { id: true, number: true } } },
        },
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, amountPaise: true, durationDays: true },
    }),
  ]);
  if (!user) notFound();

  const info: Array<[string, string]> = [
    ["Name", user.name ?? "-"],
    ["Role", user.role],
    ["Email verified", user.emailVerified ? user.emailVerified.toLocaleDateString("en-IN") : "No"],
    ["Auth", user.passwordHash ? "Password" : "OAuth / Google"],
    ["Joined", user.createdAt.toLocaleDateString("en-IN")],
    ["GSTIN", user.gstin ?? "-"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/users" className="text-sm text-muted hover:text-accent">
            ← Users
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-black break-all">{user.email}</h1>
        </div>
        <AdminNav />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold">Account</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
                <dd className="mt-0.5 break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <AdminUserActions
          userId={user.id}
          emailVerified={!!user.emailVerified}
          hasPassword={!!user.passwordHash}
          plans={plans.map((p) => ({
            id: p.id,
            name: p.name,
            price: paiseToInr(p.amountPaise),
            durationDays: p.durationDays,
          }))}
          subscriptions={user.subscriptions.map((s) => ({
            id: s.id,
            planName: s.plan.name,
            status: s.status,
            periodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : null,
          }))}
        />
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Payments</h2>
        {user.payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payments.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2">Date</th>
                <th className="pb-2">Gateway</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {user.payments.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-2.5 text-muted">{p.createdAt.toLocaleDateString("en-IN")}</td>
                  <td className="py-2.5">{p.gateway}</td>
                  <td className="py-2.5">{p.status}</td>
                  <td className="py-2.5 text-right">{paiseToInr(p.amountPaise)}</td>
                  <td className="py-2.5 text-right">
                    {p.invoice ? (
                      <a
                        href={`/api/invoices/${p.invoice.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {p.invoice.number}
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
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
