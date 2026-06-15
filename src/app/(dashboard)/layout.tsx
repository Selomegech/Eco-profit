import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/app/LogoutButton";

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
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto px-3 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
