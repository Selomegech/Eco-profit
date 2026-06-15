import nodemailer from "nodemailer";
import { env } from "@/lib/env";

// Single swappable email transport. Today: SMTP via nodemailer. To switch
// providers later, replace the transport here — callers use sendMail().
let transporter: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? "587"),
      secure: env.SMTP_SECURE === "true",
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const tx = getTransport();
  const from = env.EMAIL_FROM || "Ecom Profit <no-reply@localhost>";
  if (!tx) {
    // No SMTP configured (e.g. local dev) — log instead of throwing so the
    // signup/payment flow still completes.
    console.warn(`[email:disabled] would send "${msg.subject}" to ${msg.to}`);
    return;
  }
  await tx.sendMail({
    from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text ?? stripHtml(msg.html),
    html: msg.html,
    attachments: msg.attachments,
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
