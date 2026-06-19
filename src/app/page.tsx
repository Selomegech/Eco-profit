import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { PricingCards } from "@/components/marketing/PricingCards";
import { ScrollFX } from "@/components/marketing/home/ScrollFX";
import { DemoTabs } from "@/components/marketing/home/DemoTabs";

const caps = [
  "Total Sales",
  "Net Settlement",
  "CTO %",
  "RTO %",
  "Net Profit",
  "Platform Comparison",
  "Settlement Cycle",
  "Net Profit / Unit",
  "Platform Fees %",
  "Pending Settlement",
  "Ad Cost %",
];

const features: [string, string, string][] = [
  [
    "True Profit Tracking",
    "Real net profit per order, day and SKU — not just revenue.",
    "M3 13h4v8H3zM10 3h4v18h-4zM17 9h4v12h-4z",
  ],
  [
    "Marketplace Fee Analysis",
    "Every commission, closing and shipping fee captured and matched.",
    "M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6M7 9h11",
  ],
  [
    "SKU-Level Profitability",
    "Spot which products make money and which quietly lose it.",
    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  ],
  [
    "Flipkart & Meesho Reporting",
    "Both marketplaces unified in one true profit view.",
    "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20",
  ],
];

const pains = [
  "Marketplace commissions hidden across 12 different fee heads",
  "Ad spend leaking into low-margin SKUs",
  "Returns silently erasing weeks of profit",
  "Shipping & packaging costs nobody reconciles",
  "GST and TCS confusion at settlement time",
];

const costRows: [string, string, string, string][] = [
  ["Gross Revenue", "100", "₹5,00,000", "linear-gradient(90deg,#475569,#64748b)"],
  ["− Marketplace fees", "76", "−₹1,20,000", "linear-gradient(90deg,#7c3aed,#a855f7)"],
  ["− Ad spend", "58", "−₹90,000", "linear-gradient(90deg,#06b6d4,#00e5ff)"],
  ["− Returns", "44", "−₹70,000", "linear-gradient(90deg,#f43f5e,#fb7185)"],
  ["− Shipping & ops", "34", "−₹50,000", "linear-gradient(90deg,#f59e0b,#fbbf24)"],
];

const steps: [string, string, string][] = [
  ["1", "Import data", "Bring in your Flipkart & Meesho order and settlement files."],
  ["2", "Add SKU costs", "Provide the cost price of each SKU for accurate margins."],
  ["3", "Calculate true profit", "Real net profit computed per order, SKU and day."],
  ["4", "Get insights", "See exactly what to fix, cut or scale to grow your margins."],
];

const aiPoints: [string, string][] = [
  ["Finds hidden profit leaks", "Spots low-margin SKUs and rising marketplace fees before they hurt."],
  ["Recommends action, not just data", "Tells you what to cut, raise or scale — with the rupee impact."],
  ["Catches settlement mismatches", "Matches every Flipkart & Meesho settlement and flags discrepancies."],
];

const oldWay = [
  "Manual spreadsheet chaos",
  "Revenue reports, no real profit",
  "Static data, days out of date",
  "Fees & returns missed entirely",
  "Decisions on gut feel",
];
const newWay = [
  "Automated, reconciled insights",
  "True profit, down to the SKU",
  "Updated every time you import",
  "Every fee & return captured",
  "Decisions backed by data",
];

const testimonials: [string, string, string, string][] = [
  ["I thought we were doing ₹40L profit. Ecom Profit showed it was ₹26L. That number changed every decision I make.", "Priya Sharma", "Flipkart Seller", "Profit clarity +42%"],
  ["Marketplace fees and returns were quietly eating ₹1.2L a month. Ecom Profit paid for itself in days.", "Rahul Mehta", "Meesho Seller", "Saved ₹14L/year"],
  ["Reconciling Flipkart + Meesho settlements used to take two days a week. Now it is minutes.", "Karan Patel", "Flipkart + Meesho Seller", "8 hrs saved weekly"],
  ["As a CA I manage profit for several seller clients. Ecom Profit is how I report real profit at scale.", "Sneha Rao", "eCommerce Accountant", "Clean exports"],
  ["The SKU-level view exposed 6 products we were selling at a loss after fees. Cut them, margin jumped.", "Amit Verma", "Meesho Seller", "Net margin +5.8%"],
  ["Finally a profit number I trust every morning. No more spreadsheet guesswork.", "Divya Nair", "Flipkart Seller", "Daily profit pulse"],
];

const faqs: [string, string][] = [
  ["How does Ecom Profit calculate my real profit?", "It takes your order and settlement data, then subtracts marketplace fees, returns, shipping and your SKU cost prices — matched to each transaction — to give true net profit per order, SKU and day."],
  ["Which marketplaces do you support?", "Flipkart and Meesho. Ecom Profit is built specifically for these two marketplaces and shows both in one unified profit view."],
  ["Do I need to import my data myself?", "Yes. You download your order and settlement reports from Flipkart and Meesho and import them — the tool runs fully in your browser and never connects to your accounts."],
  ["Is my data secure?", "Completely. The analytics tool runs locally in your browser. Your sales data never leaves your device and nothing is uploaded to our servers."],
  ["How long does setup take?", "Just a few minutes. Open the tool, import your reports and add your SKU costs — your profit dashboard populates instantly."],
  ["How does billing work?", "Choose Monthly, 6 Months, or Yearly. Pay securely via PhonePe (UPI, cards or netbanking). Your subscription activates automatically and you get a GST invoice by email."],
  ["Can I cancel anytime?", "Yes. You keep access until the end of your current period; we simply won't renew. Manage everything from your dashboard."],
];

const Check = ({ fill = "#14F195" }: { fill?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={fill}>
    <path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2 18.6 6.8z" />
  </svg>
);
const Cross = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke="#fb7185" strokeWidth="2" />
  </svg>
);

export default function Home() {
  return (
    <>
      <ScrollFX />
      <Nav />
      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow reveal">
                <span className="dot" />
                Profit intelligence for online sellers
              </span>
              <h1 className="reveal d1">
                Know Your Real <span className="gradient-text">eCommerce Profit</span> in Real Time
              </h1>
              <p className="sub reveal d2">
                Stop guessing your margins. Track sales, fees, returns, shipping costs, and true
                profitability across Flipkart &amp; Meesho in one dashboard.
              </p>
              <div className="hero-cta reveal d3">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get Started <span className="arrow">→</span>
                </Link>
                <a href="#demo" className="btn btn-ghost btn-lg">
                  View Demo
                </a>
              </div>
              <div className="works-row reveal d4">
                <span className="works-lab">Built for</span>
                <span className="mk-chip sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/flip.jpg" alt="Flipkart" />
                </span>
                <span className="mk-chip sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/meesho.png" alt="Meesho" />
                </span>
              </div>
            </div>

            <div className="dash reveal d2">
              <div className="dash-main">
                <div className="dash-top">
                  <span className="t">Profit Overview</span>
                  <span className="live">Live</span>
                </div>
                <div className="kpis">
                  <div className="kpi">
                    <div className="lab">Today&apos;s Revenue</div>
                    <div className="val">
                      ₹<span className="count" data-to="486200">0</span>
                    </div>
                    <div className="chg up">▲ 12.4%</div>
                  </div>
                  <div className="kpi accent">
                    <div className="lab">Today&apos;s Profit</div>
                    <div className="val">
                      ₹<span className="count" data-to="98740">0</span>
                    </div>
                    <div className="chg up">▲ 8.1%</div>
                  </div>
                  <div className="kpi">
                    <div className="lab">Total Costs</div>
                    <div className="val">
                      ₹<span className="count" data-to="54300">0</span>
                    </div>
                    <div className="chg down">▼ 3.2%</div>
                  </div>
                  <div className="kpi">
                    <div className="lab">Net Margin</div>
                    <div className="val">
                      <span className="count" data-to="20.3" data-dec="1">0</span>%
                    </div>
                    <div className="chg up">▲ 1.4%</div>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="ch-head">
                    <span className="l">Profit Trend · 30 days</span>
                    <span className="v">+₹2.4L</span>
                  </div>
                  <svg
                    id="heroChart"
                    viewBox="0 0 320 90"
                    preserveAspectRatio="none"
                    style={{ width: "100%", height: 88 }}
                  />
                </div>
              </div>
              <div className="float-card fc1">
                <div className="fc-l">Marketplace Fees</div>
                <div className="fc-v up">₹38,420</div>
              </div>
              <div className="float-card fc2">
                <div className="fc-l">Net Profit ▲</div>
                <div className="fc-v" style={{ color: "var(--green)" }}>
                  +18.6%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="trust">
          <div className="wrap">
            <p className="lab reveal">Built exclusively for</p>
            <div className="mk-logos reveal">
              <div className="mk-chip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/flip.jpg" alt="Flipkart" />
              </div>
              <div className="mk-chip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/meesho.png" alt="Meesho" />
              </div>
            </div>
            <div className="metrics">
              <div className="metric reveal">
                <div className="n">
                  ₹<span className="count" data-to="500" data-suf="Cr+">0</span>
                </div>
                <div className="l">Revenue tracked</div>
              </div>
              <div className="metric reveal d1">
                <div className="n">
                  <span className="count" data-to="20000" data-suf="+">0</span>
                </div>
                <div className="l">Products monitored</div>
              </div>
              <div className="metric reveal d2">
                <div className="n">
                  <span className="count" data-to="1000" data-suf="+">0</span>
                </div>
                <div className="l">Brands using Ecom Profit</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="problem" id="problem">
          <div className="wrap problem-grid">
            <div className="reveal">
              <span className="eyebrow">The problem</span>
              <h2 style={{ marginTop: 16 }}>
                Revenue isn&apos;t <span className="gradient-text">profit.</span>
              </h2>
              <p className="lead">
                You see ₹5,00,000 in sales and feel great. Then the marketplace takes its cut, ads
                eat the margin, returns pile up — and your real profit is a fraction of what you
                thought.
              </p>
              <div className="pain-list">
                {pains.map((p) => (
                  <div className="pain" key={p}>
                    <span className="x">✕</span> {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal d2">
              <div className="cost-stack" id="costStack">
                {costRows.map(([name, w, amt, bg], i) => (
                  <div className="cost-row" key={name}>
                    <span className="name">{name}</span>
                    <div className="bar-bg">
                      <div className="bar-fill" data-w={w} style={{ background: bg }} />
                    </div>
                    <span className={`amt${i === 0 ? "" : " down"}`} style={i === 0 ? { color: "#cbd5e1" } : undefined}>
                      {amt}
                    </span>
                  </div>
                ))}
              </div>
              <div className="profit-final">
                <span className="pl">Your real net profit</span>
                <span className="pv">₹1,70,000</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">How it works</span>
              <h2>
                From marketplace chaos to <span className="gradient-text">clear profit</span>
              </h2>
              <p>
                Four simple steps. No marketplace login needed — import your data and let Ecom Profit
                do the profit math.
              </p>
            </div>
            <div className="steps" id="steps">
              <div className="step-line">
                <div className="prog" id="stepProg" />
              </div>
              {steps.map(([num, t, d], i) => (
                <div className={`step reveal${i ? ` d${i}` : ""}`} key={num}>
                  <div className="num">{num}</div>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section className="demo" id="demo">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Product tour</span>
              <h2>
                One dashboard for <span className="gradient-text">every number that matters</span>
              </h2>
              <p>
                Switch between sales, profit, SKU-level data and returns — all reconciled across
                Flipkart &amp; Meesho.
              </p>
            </div>
            <div className="cap-marquee reveal">
              <div className="cap-track">
                {[...caps, ...caps].map((c, i) => (
                  <span className="cap" key={`${c}-${i}`}>
                    <span className="cap-dot" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <DemoTabs />
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Features</span>
              <h2>
                Built for sellers who want <span className="gradient-text">the full picture</span>
              </h2>
              <p>
                Everything you need to measure, understand and grow real profit — not just revenue.
              </p>
            </div>
            <div className="feat-grid">
              {features.map(([t, d, path]) => (
                <div className="feat reveal" key={t}>
                  <div className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#fgrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={path} />
                    </svg>
                  </div>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="fgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#00E5FF" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="ai">
          <div className="wrap ai-grid">
            <div className="ai-chat reveal">
              <div className="ai-head">
                <div className="ai-av">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
                  </svg>
                </div>
                <div>
                  <div className="nm">Ecom Profit Insights</div>
                  <div className="st">Analyzing your store</div>
                </div>
              </div>
              <div className="ai-msgs">
                <Msg>
                  Your top-selling SKU <b>Bluetooth Earbuds</b> generates only <b>4% profit</b> after
                  fees. Consider a price increase.
                </Msg>
                <Msg>
                  Returns reduced profit by <b>18%</b> last month — mostly apparel sizing. Better size
                  charts could save <b>₹62,000</b>.
                </Msg>
                <Msg>
                  3 SKUs are selling at a <b>net loss</b> after fees &amp; returns. Review pricing or
                  delist them.
                </Msg>
              </div>
            </div>
            <div className="reveal d1">
              <span className="eyebrow">Insights</span>
              <h2 style={{ marginTop: 16 }}>
                Insights that <span className="gradient-text">surface what matters</span>
              </h2>
              <p className="lead">
                Ecom Profit reads every order and surfaces the decisions that actually move your
                margin — in plain language.
              </p>
              <div className="ai-points">
                {aiPoints.map(([t, d]) => (
                  <div className="ai-point" key={t}>
                    <span className="ck">✓</span>
                    <div>
                      <div className="tt">{t}</div>
                      <div className="dd">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="compare">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">The difference</span>
              <h2>
                Spreadsheet chaos vs <span className="gradient-text">profit intelligence</span>
              </h2>
            </div>
            <div className="cmp reveal d1">
              <div className="cmp-col old">
                <div className="h">Traditional reporting</div>
                {oldWay.map((row) => (
                  <div className="cmp-row" key={row}>
                    <Cross /> {row}
                  </div>
                ))}
              </div>
              <div className="cmp-vs">
                <span>VS</span>
              </div>
              <div className="cmp-col new">
                <div className="h">
                  <span className="brand-word" style={{ fontSize: 17 }}>
                    Ecom <b>Profit</b>
                  </span>
                </div>
                {newWay.map((row) => (
                  <div className="cmp-row" key={row}>
                    <Check /> {row}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testi">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Loved by sellers</span>
              <h2>
                Brands that finally <span className="gradient-text">know their profit</span>
              </h2>
              <p>From first-time sellers to 8-figure brands.</p>
            </div>
          </div>
          <div className="testi-track-wrap reveal">
            <div className="testi-track">
              {[...testimonials, ...testimonials].map(([q, n, r, g], i) => (
                <div className="tcard" key={`${n}-${i}`}>
                  <div className="quote">&ldquo;{q}&rdquo;</div>
                  <div className="who">
                    <div className="av">{n[0]}</div>
                    <div>
                      <div className="nm">{n}</div>
                      <div className="rl">{r}</div>
                    </div>
                  </div>
                  <div className="growth">↑ {g}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing" id="pricing">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">Pricing</span>
              <h2>
                Simple pricing that <span className="gradient-text">pays for itself</span>
              </h2>
              <p>Most sellers recover the cost in the first week of finding leaks.</p>
            </div>
            <div className="reveal d1">
              <PricingCards ctaHref="/register" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq" id="faq">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="eyebrow">FAQ</span>
              <h2>
                Questions, <span className="gradient-text">answered</span>
              </h2>
            </div>
            <div className="faq-list reveal d1">
              {faqs.map(([q, a]) => (
                <details className="faq-item" key={q}>
                  <summary>
                    {q}
                    <span className="ico">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="faq-a">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="finalcta">
          <div className="wrap">
            <div className="cta-box reveal">
              <h2>
                Every order generates revenue.
                <br />
                Only smart sellers know their <span className="gradient-text">profit.</span>
              </h2>
              <p>Join the next generation of data-driven eCommerce brands.</p>
              <div className="hero-cta">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get Started <span className="arrow">→</span>
                </Link>
                <a href="#demo" className="btn btn-ghost btn-lg">
                  View Demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Msg({ children }: { children: React.ReactNode }) {
  return (
    <div className="ai-msg">
      <div className="mav">
        <svg viewBox="0 0 24 24" fill="#fff">
          <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
        </svg>
      </div>
      <div className="bubble">{children}</div>
    </div>
  );
}
