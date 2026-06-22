import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { paiseToInr } from "@/lib/money";
import { AdminNav } from "../AdminNav";

export const metadata = { title: "Payments - Admin" };

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const [payments, totals] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, email: true } },
        invoice: { select: { id: true, number: true } },
      },
    }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true, taxPaise: true } }),
  ]);

  const statusClass: Record<string, string> = {
    PAID: "text-pos",
    FAILED: "text-neg",
    REFUNDED: "text-accent2",
    CREATED: "text-muted",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-black">Payments</h1>
        <AdminNav />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat k="Gross revenue (paid)" v={paiseToInr(totals._sum.amountPaise ?? 0)} />
        <Stat k="GST collected" v={paiseToInr(totals._sum.taxPaise ?? 0)} />
        <Stat k="Shown" v={String(payments.length)} />
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Latest payments</h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payments yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Gateway</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2.5 text-muted">{p.createdAt.toLocaleDateString("en-IN")}</td>
                    <td className="py-2.5">
                      <Link href={`/admin/users/${p.user.id}`} className="hover:text-accent">
                        {p.user.email}
                      </Link>
                    </td>
                    <td className="py-2.5">{p.gateway}</td>
                    <td className={"py-2.5 font-medium " + (statusClass[p.status] ?? "")}>
                      {p.status}
                    </td>
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
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-muted">{k}</div>
      <div className="mt-1 font-serif text-2xl font-black">{v}</div>
    </div>
  );
}
