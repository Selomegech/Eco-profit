import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecom Profit — Know your real marketplace profit for Meesho & Flipkart",
  description:
    "Track sales, fees, returns, shipping and true profitability across Flipkart & Meesho in one dashboard. Settlement reconciliation, SKU-level P&L and GST-ready reports. Your data never leaves your browser.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Ecom Profit — Marketplace P&L",
    description: "Settlement reconciliation, SKU profitability & MIS for Indian marketplace sellers.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Reading a request header opts every route into dynamic rendering. This is
  // required for the per-request CSP nonce (generated in middleware) to be
  // stamped onto Next.js's own bootstrap scripts. Without it, hosts that serve
  // the statically-prerendered HTML (e.g. Netlify) ship a stale/absent nonce,
  // and under our `strict-dynamic` CSP the browser blocks ALL scripts — so the
  // page never hydrates and client components (login/register forms) vanish.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved light/dark choice before first paint so the theme
            toggle never flashes. Nonce'd to satisfy our strict-dynamic CSP. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <div className="aurora" aria-hidden="true">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="grid-overlay" aria-hidden="true" />
        <div className="relative z-[2] flex min-h-full flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
