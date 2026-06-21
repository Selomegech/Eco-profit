"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

// Inline spinner that appears only while the parent <Link> navigation is
// pending. It is always rendered (fixed size) and only toggles opacity, so it
// never causes layout shift. Must live inside a <Link> to read its status.
function Spinner() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent align-[-2px] transition-opacity ${
        pending ? "animate-spin opacity-100" : "opacity-0"
      }`}
    />
  );
}

// Drop-in replacement for <Link> that shows a pending spinner after a click,
// giving the button feedback while the destination route loads. Prefetch is
// disabled by default so the pending phase is actually observable on slower,
// dynamic destinations (e.g. the tool iframe).
export function PendingLink({
  href,
  className,
  children,
  prefetch = false,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  prefetch?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`inline-flex items-center justify-center gap-2 ${className ?? ""}`}
    >
      {children}
      <Spinner />
    </Link>
  );
}
