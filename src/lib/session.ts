import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

// Current subscription + plan for a user (latest row), plus a derived
// "active" flag based on the validity window.
export async function getSubscriptionState(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
  const now = new Date();
  const isActive =
    !!sub && sub.status === "ACTIVE" && !!sub.currentPeriodEnd && sub.currentPeriodEnd > now;
  return { sub, isActive };
}
