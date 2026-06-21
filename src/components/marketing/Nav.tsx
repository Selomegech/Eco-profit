import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { NavScroll } from "./NavScroll";

const links = [
  { href: "/#problem", label: "Why" },
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  return (
    <nav className="site-nav" id="nav">
      <NavScroll />
      <div className="bar">
        <Link href="/" className="logo">
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

        <div className="navlinks">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-cta">
          <ThemeToggle />
          <Link href="/register" className="btn btn-ghost btn-sm">
            View Demo
          </Link>
          <Link href="/login" className="btn btn-primary btn-sm">
            Log in
          </Link>
          <Link href="/#features" className="menu-btn" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
