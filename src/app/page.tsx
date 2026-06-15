import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { PricingCards } from "@/components/marketing/PricingCards";

const features = [
  {
    title: "Settlement reconciliation",
    body: "Match every Meesho & Flipkart payout to its orders. See what's settled, what's pending, and where money is stuck — with ageing buckets.",
    icon: "⇄",
  },
  {
    title: "SKU-level P&L",
    body: "Drill into profit and loss per SKU after fees, commissions, shipping and returns. Find the products quietly losing you money.",
    icon: "▦",
  },
  {
    title: "GST-ready summaries",
    body: "Tax-aware breakdowns and per-SKU GST overrides, so your numbers line up with what you file.",
    icon: "₹",
  },
  {
    title: "One-click exports",
    body: "Generate polished Excel workbooks and PDF MIS reports for any date range, marketplace, or merged across both.",
    icon: "⤓",
  },
  {
    title: "Multi-month, multi-marketplace",
    body: "Drop in as many monthly settlement files as you like. Compare Meesho vs Flipkart side by side.",
    icon: "⊞",
  },
  {
    title: "Private by design",
    body: "Files are parsed entirely in your browser. Your sales data never touches our servers — ever.",
    icon: "🔒",
  },
];

const steps = [
  { n: "1", t: "Subscribe & sign in", d: "Pick a plan, create your account, and log in to your dashboard." },
  { n: "2", t: "Upload your reports", d: "Drag in Meesho & Flipkart settlement and sales files. Everything is processed locally." },
  { n: "3", t: "Get your numbers", d: "Instant reconciliation, SKU profit, GST summaries and downloadable reports." },
];

const faqs = [
  {
    q: "Do you store my sales data?",
    a: "No. The analytics tool runs entirely in your browser — your settlement and sales files are never uploaded to or stored on our servers. We only store your account and subscription details.",
  },
  {
    q: "Which marketplaces are supported?",
    a: "Meesho and Flipkart settlement and sales reports today, including multi-month uploads and a merged cross-marketplace view.",
  },
  {
    q: "How does billing work?",
    a: "Choose Monthly, Quarterly, or Annual. Pay securely via Stripe or Razorpay. Your subscription activates automatically and you get a GST-compliant invoice by email.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You keep access until the end of your current period; we simply won't renew. Manage everything from your dashboard.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-line bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              For Meesho &amp; Flipkart sellers
            </span>
            <h1 className="mt-6 font-serif text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Know your <span className="text-accent">real</span> marketplace profit.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
              Ecom Profit reconciles your settlements, breaks down profit by SKU, and produces
              GST-ready reports — in seconds, with your data never leaving your browser.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                Start now
              </Link>
              <a
                href="#features"
                className="rounded-lg border border-ink px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper"
              >
                See what it does
              </a>
            </div>
            <p className="mt-4 text-xs text-muted">No card required to create an account · Cancel anytime</p>
          </div>

          {/* Stat strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["2", "Marketplaces"],
              ["100%", "In-browser"],
              ["SKU", "Level detail"],
              ["GST", "Ready reports"],
            ].map(([v, k]) => (
              <div key={k} className="rounded-xl border border-line bg-card p-5 text-center shadow-sm">
                <div className="font-serif text-3xl font-black text-accent">{v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted">{k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-line bg-card/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-black md:text-4xl">
                Everything you need to read your P&amp;L
              </h2>
              <p className="mt-3 text-muted">
                Built for the realities of Indian marketplace accounting — fees, returns, pending
                settlements and all.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-xl text-accent">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center font-serif text-3xl font-black md:text-4xl">
              Up and running in three steps
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent font-serif text-xl font-black text-white">
                    {s.n}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-y border-line bg-card/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-black md:text-4xl">Simple, honest pricing</h2>
              <p className="mt-3 text-muted">
                Every plan includes the full toolset. Prices are inclusive of GST.
              </p>
            </div>
            <div className="mt-12">
              <PricingCards ctaHref="/register" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-center font-serif text-3xl font-black md:text-4xl">
              Frequently asked
            </h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-card">
              {faqs.map((f) => (
                <details key={f.q} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {f.q}
                    <span className="text-accent transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-5xl rounded-3xl bg-accent px-8 py-14 text-center text-white">
            <h2 className="font-serif text-3xl font-black md:text-4xl">
              Stop guessing your margins.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Join sellers who finally know which SKUs make money. Start with Ecom Profit today.
            </p>
            <Link
              href="/register"
              className="mt-7 inline-block rounded-lg bg-white px-7 py-3 text-sm font-semibold text-accent transition hover:bg-paper"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
