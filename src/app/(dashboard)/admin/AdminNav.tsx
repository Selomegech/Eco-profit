"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/plans", label: "Plans" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1 text-sm">
      {tabs.map((t) => {
        // "/admin" matches only itself; the others match their subtree so a
        // detail page like /admin/users/[id] keeps the Users tab highlighted.
        const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              "rounded-lg px-3.5 py-2 font-medium transition " +
              (active ? "bg-accent text-on-accent" : "text-muted hover:text-ink")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
