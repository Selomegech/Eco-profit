import { LegalLayout, H2 } from "@/components/marketing/LegalLayout";

export const metadata = { title: "Refund Policy - Ecom Profit" };

export default function RefundPage() {
  return (
    <LegalLayout title="Refund &amp; Cancellation Policy" updated="15 June 2026">
      <p>
        We want you to be satisfied with Ecom Profit. This policy explains cancellations and refunds
        for subscriptions purchased through our website.
      </p>

      <H2>1. Cancellation</H2>
      <p>
        You can stop using the Service at any time. Since plans are purchased for a fixed period and
        do not auto-renew, cancelling simply means not purchasing the next period. You retain access
        until your current period ends.
      </p>

      <H2>2. Refund Eligibility</H2>
      <p>
        If you experience a technical issue that prevents you from using the Service and we are
        unable to resolve it within a reasonable time, you may request a pro-rata refund for the
        unused portion of your current period. Requests must be made within 7 days of the charge.
      </p>

      <H2>3. Non-Refundable Cases</H2>
      <p>
        Refunds are not provided for change of mind after substantial use, for periods already
        elapsed, or where access was available but unused.
      </p>

      <H2>4. How to Request</H2>
      <p>
        Email [billing@ecomprofit.example] from your registered address with your invoice number.
        Approved refunds are returned to the original payment method via the original gateway within
        5–10 business days.
      </p>
    </LegalLayout>
  );
}
