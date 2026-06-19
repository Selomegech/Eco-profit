import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="font-serif text-3xl font-black text-accent">
        Ecom Profit
      </Link>
      <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-sm text-muted">{footer}</div>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
export const labelClass = "block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5";
export const primaryBtn =
  "w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50";
