import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "../AdminNav";
import { AdminUsersList } from "./AdminUsersList";

export const metadata = { title: "Users - Admin" };

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: { select: { name: true } } },
      },
    },
  });

  const rows = users.map((u) => {
    const sub = u.subscriptions[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      verified: !!u.emailVerified,
      planName: sub?.plan.name ?? null,
      status: sub?.status ?? null,
      createdAt: u.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-black">Users</h1>
        <AdminNav />
      </div>
      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <AdminUsersList rows={rows} />
      </div>
    </div>
  );
}
