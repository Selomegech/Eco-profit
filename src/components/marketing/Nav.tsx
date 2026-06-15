import Link from "next/link";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="font-serif text-2xl font-black tracking-tight text-accent">
          Ecom&nbsp;Profit
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink/80 hover:text-accent">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="rounded-md px-3.5 py-2 text-sm font-medium text-ink hover:bg-ink/5">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
