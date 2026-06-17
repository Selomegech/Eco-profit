"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

// Inline, fixed-size pending hint shown on the clicked link while the next
// route loads. Rendered always (reserves space) and toggled to avoid layout
// shift, per Next.js useLinkStatus guidance.
function LinkSpinner() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-1.5 inline-block h-3 w-3 shrink-0 rounded-full border-[1.5px] border-current border-t-transparent align-[-1px] ${
        pending ? "animate-spin opacity-70" : "opacity-0"
      }`}
    />
  );
}

export function NavLinks({
  links,
  variant = "desktop",
}: {
  links: { href: string; label: string }[];
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  const wrapper =
    variant === "desktop"
      ? "hidden items-center gap-1 md:flex"
      : "flex items-center gap-1 overflow-x-auto px-3 py-2 md:hidden";

  return (
    <nav className={wrapper}>
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            prefetch={false}
            className={`flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-accent/10 text-accent" : "text-ink/80 hover:bg-ink/5"
            }`}
          >
            {l.label}
            <LinkSpinner />
          </Link>
        );
      })}
    </nav>
  );
}
