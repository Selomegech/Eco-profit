import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { paiseToInr } from "@/lib/money";
import { renderInvoicePdf } from "@/lib/invoice/pdf";
import { sendMail } from "@/lib/email/mailer";
import { paymentConfirmedTemplate } from "@/lib/email/templates";

export async function buildInvoicePdf(invoiceId: string): Promise<{ buffer: Buffer; number: string }> {
  const inv = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { user: true },
  });
  const buffer = await renderInvoicePdf({
    number: inv.number,
    issuedAt: inv.issuedAt,
    seller: {
      name: env.SELLER_LEGAL_NAME,
      gstin: inv.sellerGstin,
      address: env.SELLER_ADDRESS,
      email: env.SELLER_EMAIL,
      stateCode: env.SELLER_STATE_CODE,
    },
    buyer: {
      name: inv.buyerName,
      email: inv.user.email,
      gstin: inv.buyerGstin,
      state: inv.buyerState,
    },
    placeOfSupply: inv.placeOfSupply,
    lineDescription: `${env.APP_NAME} subscription`,
    sac: inv.sac,
    gstRate: inv.gstRate,
    subtotalPaise: inv.subtotalPaise,
    cgstPaise: inv.cgstPaise,
    sgstPaise: inv.sgstPaise,
    igstPaise: inv.igstPaise,
    totalPaise: inv.totalPaise,
    isInterState: inv.isInterState,
  });
  return { buffer, number: inv.number };
}

export async function emailPaymentConfirmation(opts: {
  invoiceId: string;
  toEmail: string;
  planName: string;
  totalPaise: number;
  validTill: Date;
}): Promise<void> {
  const { buffer, number } = await buildInvoicePdf(opts.invoiceId);
  const tpl = paymentConfirmedTemplate({
    planName: opts.planName,
    amount: paiseToInr(opts.totalPaise),
    validTill: opts.validTill.toLocaleDateString("en-IN"),
    invoiceNumber: number,
  });
  await sendMail({
    to: opts.toEmail,
    subject: tpl.subject,
    html: tpl.html,
    attachments: [
      {
        filename: `${number.replace(/\//g, "-")}.pdf`,
        content: buffer,
        contentType: "application/pdf",
      },
    ],
  });
}
