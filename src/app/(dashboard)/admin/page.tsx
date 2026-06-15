import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { AdminUsers } from "./AdminUsers";

export const metadata = { title: "Admin — Ecom Profit" };

export default async function AdminPage() {
  await requireAdmin();

  const [userCount, activeSubs, revenue, recentPayments, users] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { user: { select: { email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: { select: { name: true } } },
        },
      },
    }),
  ]);

  const stats = [
    { k: "Users", v: String(userCount) },
    { k: "Active subscriptions", v: String(activeSubs) },
    { k: "Gross revenue", v: paiseToInr(revenue._sum.amountPaise ?? 0) },
    { k: "Recent payments", v: String(recentPayments.length) },
  ];

  const userRows = users.map((u) => {
    const sub = u.subscriptions[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      verified: !!u.emailVerified,
      subscriptionId: sub?.id ?? null,
      planName: sub?.plan.name ?? null,
      status: sub?.status ?? null,
      periodEnd: sub?.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-black">Admin</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-xl border border-line bg-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted">{s.k}</div>
            <div className="mt-1 font-serif text-2xl font-black">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold">Recent payments</h2>
        {recentPayments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payments yet.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-2">User</th>
                <th className="pb-2">Gateway</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-2.5">{p.user.email}</td>
                  <td className="py-2.5">{p.gateway}</td>
                  <td className="py-2.5 text-right">{paiseToInr(p.amountPaise)}</td>
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
        <h2 className="font-serif text-xl font-semibold">Users &amp; subscriptions</h2>
        <AdminUsers rows={userRows} />
      </div>
    </div>
  );
}
