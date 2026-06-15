import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="font-serif text-xl font-black text-accent">Ecom Profit</div>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Settlement reconciliation, SKU profitability & GST-ready reports for Meesho and Flipkart
            sellers. Your data stays in your browser.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Product</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/#features" className="text-ink/80 hover:text-accent">Features</a></li>
            <li><Link href="/pricing" className="text-ink/80 hover:text-accent">Pricing</Link></li>
            <li><Link href="/login" className="text-ink/80 hover:text-accent">Log in</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Legal</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/terms" className="text-ink/80 hover:text-accent">Terms of Service</Link></li>
            <li><Link href="/privacy" className="text-ink/80 hover:text-accent">Privacy Policy</Link></li>
            <li><Link href="/refund" className="text-ink/80 hover:text-accent">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Ecom Profit. All rights reserved.
      </div>
    </footer>
  );
}
