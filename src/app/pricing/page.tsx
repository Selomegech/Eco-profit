import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata = { title: "Pricing — Ecom Profit" };

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl font-black md:text-5xl">Pricing</h1>
          <p className="mt-3 text-muted">
            One toolset, three commitments. All prices include GST and you can pay with Stripe or
            Razorpay.
          </p>
        </div>
        <div className="mt-14">
          <PricingCards ctaHref="/register" />
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          Already subscribed? Manage your plan from your{" "}
          <a href="/billing" className="font-semibold text-accent hover:underline">billing page</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
