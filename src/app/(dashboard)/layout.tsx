import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/app/LogoutButton";
import { NavLinks } from "@/components/app/NavLinks";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/app", label: "Open app" },
    { href: "/billing", label: "Billing" },
    { href: "/account", label: "Account" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-serif text-xl font-black text-accent">
              Ecom Profit
            </Link>
            <NavLinks links={links} variant="desktop" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
        <NavLinks links={links} variant="mobile" />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
