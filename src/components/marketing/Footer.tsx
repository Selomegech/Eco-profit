import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo_icon.png" alt="" width={34} height={34} className="h-[32px] w-auto" />
              <span className="brand-word">
                Ecom <b>Profit</b>
              </span>
            </Link>
            <p>
              Know your real profit. Grow smarter. Profit intelligence for Flipkart &amp; Meesho
              sellers — settlement reconciliation, SKU-level P&amp;L and GST-ready reports.
            </p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <a href="/#features">Features</a>
            <a href="/#demo">Product tour</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login">Log in</Link>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a href="/#problem">Why Ecom Profit</a>
            <a href="/#how">How it works</a>
            <a href="/#faq">FAQ</a>
          </div>
          <div className="foot-col">
            <h5>Legal</h5>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refund">Refund Policy</Link>
          </div>
        </div>
        <div className="foot-bot">
          <span>© {new Date().getFullYear()} Ecom Profit · www.ecomprofit.co.in</span>
          <span>Your data stays in your browser.</span>
        </div>
      </div>
    </footer>
  );
}
