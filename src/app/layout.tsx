import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecom Profit — Marketplace P&L for Meesho & Flipkart sellers",
  description:
    "Reconcile settlements, track SKU-level profit, and generate GST-ready reports for your Meesho and Flipkart business. Your data never leaves your browser.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Ecom Profit — Marketplace P&L",
    description: "Settlement reconciliation, SKU profitability & MIS for Indian marketplace sellers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
