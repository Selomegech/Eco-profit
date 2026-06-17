import { LegalLayout, H2 } from "@/components/marketing/LegalLayout";

export const metadata = { title: "Terms of Service — Ecom Profit" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="15 June 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Ecom Profit (the
        &quot;Service&quot;), operated by [Company Legal Name] (&quot;we&quot;, &quot;us&quot;). By
        creating an account or using the Service you agree to these Terms.
      </p>

      <H2>1. The Service</H2>
      <p>
        Ecom Profit provides browser-based analytics for e-commerce marketplace sellers, including
        settlement reconciliation, SKU-level profit reporting and exportable reports. The analytics
        engine runs in your browser; the files you analyse are not uploaded to or stored by us.
      </p>

      <H2>2. Accounts</H2>
      <p>
        You must provide accurate information and keep your credentials secure. You are responsible
        for all activity under your account. You must verify your email address before accessing
        paid features.
      </p>

      <H2>3. Subscriptions &amp; Payments</H2>
      <p>
        Paid plans are offered on a monthly, semi-annual or annual basis. Payments are processed by our
        third-party gateway (PhonePe); we do not store your card details. Access is
        granted for the period purchased and does not auto-charge unless you initiate a renewal.
        Listed prices are exclusive of GST; applicable GST (18%) is added at checkout and a tax invoice
        is issued for each payment.
      </p>

      <H2>4. Refunds</H2>
      <p>
        Refunds are governed by our <a href="/refund" className="text-accent underline">Refund Policy</a>.
      </p>

      <H2>5. Acceptable Use</H2>
      <p>
        You agree not to misuse the Service, attempt to gain unauthorised access, reverse engineer
        it, resell it without permission, or use it for unlawful purposes.
      </p>

      <H2>6. Intellectual Property</H2>
      <p>
        The Service, including its software, design and content, is owned by us and protected by
        applicable laws. We grant you a limited, non-exclusive, non-transferable licence to use it
        for your business during your subscription.
      </p>

      <H2>7. Disclaimers</H2>
      <p>
        The Service is provided &quot;as is&quot;. The reports are informational aids and do not
        constitute financial, tax or accounting advice. You are responsible for verifying figures
        before relying on them or filing returns.
      </p>

      <H2>8. Limitation of Liability</H2>
      <p>
        To the maximum extent permitted by law, our aggregate liability arising from the Service is
        limited to the amount you paid in the three months preceding the claim.
      </p>

      <H2>9. Termination</H2>
      <p>
        We may suspend or terminate access for breach of these Terms. You may stop using the Service
        at any time; access continues until the end of your paid period.
      </p>

      <H2>10. Governing Law</H2>
      <p>
        These Terms are governed by the laws of India, with exclusive jurisdiction in the courts of
        [City, State].
      </p>

      <H2>11. Contact</H2>
      <p>Questions about these Terms: [support@ecomprofit.example].</p>
    </LegalLayout>
  );
}
