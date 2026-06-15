import { LegalLayout, H2 } from "@/components/marketing/LegalLayout";

export const metadata = { title: "Privacy Policy — Ecom Profit" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="15 June 2026">
      <p>
        This Privacy Policy explains how Ecom Profit, operated by [Company Legal Name], handles your
        information. We are committed to data minimisation: the marketplace files you analyse are
        processed entirely in your browser and are never transmitted to or stored on our servers.
      </p>

      <H2>1. Information We Collect</H2>
      <p>
        <b>Account data:</b> your name, email address and password (stored only as a secure hash).
        <br />
        <b>Billing data:</b> plan, payment status, and the GST details you choose to provide for
        invoicing. Card data is handled by our payment gateways, not by us.
        <br />
        <b>Usage &amp; security logs:</b> limited technical logs (such as IP address and timestamps)
        used to operate and secure the Service.
      </p>

      <H2>2. What We Do Not Collect</H2>
      <p>
        We do not receive, view or store the settlement and sales report files you upload to the
        analytics tool. They are read locally by your browser to produce reports on your device.
      </p>

      <H2>3. How We Use Information</H2>
      <p>
        To provide and secure the Service, process payments, issue GST invoices, send transactional
        emails (verification, payment confirmation, renewal and expiry notices), and comply with
        legal obligations.
      </p>

      <H2>4. Sharing</H2>
      <p>
        We share data only with processors necessary to run the Service — our payment gateways
        (Stripe, Razorpay), email provider, and hosting/database providers — under appropriate
        safeguards. We do not sell your personal data.
      </p>

      <H2>5. Data Retention</H2>
      <p>
        Account and invoice records are retained for as long as your account is active and as
        required by tax and accounting law. You may request deletion subject to those obligations.
      </p>

      <H2>6. Security</H2>
      <p>
        We use encryption in transit, hashed passwords, strict access controls, a strong content
        security policy and audit logging. No system is perfectly secure, but we work to protect
        your data.
      </p>

      <H2>7. Your Rights</H2>
      <p>
        You may access, correct or delete your account information, and contact us with privacy
        requests at [privacy@ecomprofit.example].
      </p>

      <H2>8. Cookies</H2>
      <p>
        We use strictly necessary cookies for authentication and security. We do not use third-party
        advertising trackers.
      </p>

      <H2>9. Changes</H2>
      <p>We may update this policy and will revise the date above when we do.</p>
    </LegalLayout>
  );
}
