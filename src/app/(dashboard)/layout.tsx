import Link from "next/link";
import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/app/LogoutButton";
import { NavLinks } from "@/components/app/NavLinks";
import { ThemeToggle } from "@/components/marketing/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  // Admins are not customers - they get only the admin area, no user-facing
  // Overview/App/Billing/Account links.
  const links = isAdmin
    ? [{ href: "/admin", label: "Admin" }]
    : [
        { href: "/dashboard", label: "Overview" },
        { href: "/app", label: "Open app" },
        { href: "/billing", label: "Billing" },
        { href: "/account", label: "Account" },
      ];
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Dashboard background: a green-tinted wash that masks the marketing
          site's purple aurora on app routes. Opaque base (var(--bg)) covers the
          global glow; the radial greens give it the brand tint in both themes. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 12% -8%, rgba(52,211,153,0.14), transparent 60%), radial-gradient(60% 50% at 108% 0%, rgba(15,92,77,0.16), transparent 60%), var(--bg)",
        }}
      />
      <header className="border-b border-line bg-card">
        <div className="flex items-center justify-between px-8 py-3">
          <div className="flex items-center gap-6">
            <Link href={homeHref} className="logo">
              <span className="brand-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo_icon.png" alt="Ecom Profit" className="brand-logo-icon" />
              </span>
              <span className="brand-text">
                <span className="brand-word">
                  Ecom <b>Profit</b>
                </span>
                <span className="brand-tag">Calculate · Analyse · Maximise</span>
              </span>
            </Link>
            <NavLinks links={links} variant="desktop" />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <NavLinks links={links} variant="mobile" />
      </header>
      <main className="w-full flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
