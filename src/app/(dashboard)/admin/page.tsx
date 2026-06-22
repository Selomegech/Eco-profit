import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { AdminNav } from "./AdminNav";

export const metadata = { title: "Admin - Ecom Profit" };

export default async function AdminPage() {
  await requireAdmin();

  const [userCount, activeSubs, revenue, paidCount, recentPayments, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, createdAt: true, emailVerified: true },
    }),
  ]);

  const stats = [
    { k: "Users", v: String(userCount) },
    { k: "Active subscriptions", v: String(activeSubs) },
    { k: "Gross revenue", v: paiseToInr(revenue._sum.amountPaise ?? 0) },
    { k: "Paid payments", v: String(paidCount) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-black">Admin</h1>
        <AdminNav />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-xl border border-line bg-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted">{s.k}</div>
            <div className="mt-1 font-serif text-2xl font-black">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Recent payments</h2>
            <Link href="/admin/payments" className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No payments yet.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2.5">{p.user.email}</td>
                    <td className="py-2.5 text-right font-medium">{paiseToInr(p.amountPaise)}</td>
                    <td className="py-2.5 text-right text-muted">
                      {p.updatedAt.toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Recent signups</h2>
            <Link href="/admin/users" className="text-sm font-medium text-accent hover:underline">
              Manage users
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No users yet.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-t border-line">
                    <td className="py-2.5">
                      <Link href={`/admin/users/${u.id}`} className="hover:text-accent">
                        {u.email}
                      </Link>
                      {!u.emailVerified && (
                        <span className="ml-2 text-xs text-accent2">unverified</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-muted">
                      {u.createdAt.toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
