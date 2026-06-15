import { env } from "@/lib/env";

const BRAND = env.APP_NAME;
const ACCENT = "#0f5c4d";
const INK = "#14201d";

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f1e9;font-family:Inter,Arial,sans-serif;color:${INK}">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-family:Georgia,serif;font-weight:900;font-size:24px;color:${ACCENT};margin-bottom:8px">${BRAND}</div>
    <div style="background:#fffdf7;border:1px solid #d9d2c2;border-radius:8px;padding:28px 26px">
      <h1 style="font-family:Georgia,serif;font-size:20px;margin:0 0 14px">${title}</h1>
      ${body}
    </div>
    <p style="color:#6b6457;font-size:12px;margin-top:18px">This is an automated message from ${BRAND}. Please do not reply.</p>
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;padding:11px 22px;border-radius:6px;margin:8px 0">${label}</a>`;
}

export function verifyEmailTemplate(link: string) {
  return {
    subject: `Verify your ${BRAND} email`,
    html: shell(
      "Confirm your email",
      `<p>Welcome to ${BRAND}. Confirm your email address to activate your account.</p>
       <p>${button(link, "Verify email")}</p>
       <p style="font-size:13px;color:#6b6457">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>`,
    ),
  };
}

export function welcomeTemplate(name: string) {
  return {
    subject: `Welcome to ${BRAND}`,
    html: shell(
      `Welcome${name ? ", " + name : ""}`,
      `<p>Your account is ready. Pick a plan to start reconciling your Meesho & Flipkart settlements and tracking SKU-level profit.</p>
       <p>${button(env.APP_URL + "/pricing", "Choose a plan")}</p>`,
    ),
  };
}

export function paymentConfirmedTemplate(opts: {
  planName: string;
  amount: string;
  validTill: string;
  invoiceNumber: string;
}) {
  return {
    subject: `Payment received — ${BRAND} ${opts.planName}`,
    html: shell(
      "Payment confirmed",
      `<p>Thank you. Your <b>${opts.planName}</b> subscription is now active.</p>
       <table style="width:100%;font-size:14px;margin:14px 0">
         <tr><td style="color:#6b6457;padding:4px 0">Amount paid</td><td style="text-align:right">${opts.amount}</td></tr>
         <tr><td style="color:#6b6457;padding:4px 0">Active until</td><td style="text-align:right">${opts.validTill}</td></tr>
         <tr><td style="color:#6b6457;padding:4px 0">Invoice</td><td style="text-align:right">${opts.invoiceNumber}</td></tr>
       </table>
       <p>Your GST invoice is attached. ${button(env.APP_URL + "/app", "Open the app")}</p>`,
    ),
  };
}

export function renewalReminderTemplate(opts: { planName: string; validTill: string }) {
  return {
    subject: `Your ${BRAND} subscription renews soon`,
    html: shell(
      "Renewal reminder",
      `<p>Your <b>${opts.planName}</b> subscription is valid until <b>${opts.validTill}</b>. Renew now to avoid interruption.</p>
       <p>${button(env.APP_URL + "/billing", "Renew subscription")}</p>`,
    ),
  };
}

export function expiredTemplate(opts: { planName: string }) {
  return {
    subject: `Your ${BRAND} subscription has expired`,
    html: shell(
      "Subscription expired",
      `<p>Your <b>${opts.planName}</b> subscription has ended and access to the app is paused. Renew anytime to pick up where you left off.</p>
       <p>${button(env.APP_URL + "/pricing", "Renew now")}</p>`,
    ),
  };
}
