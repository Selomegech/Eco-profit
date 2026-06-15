import PDFDocument from "pdfkit";
import { paiseToInr } from "@/lib/money";

export interface InvoicePdfData {
  number: string;
  issuedAt: Date;
  seller: { name: string; gstin: string; address: string; email: string; stateCode: string };
  buyer: { name: string; email: string; gstin?: string | null; state?: string | null };
  placeOfSupply: string;
  lineDescription: string;
  sac: string;
  gstRate: number;
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  isInterState: boolean;
}

const INK = "#14201d";
const MUTED = "#6b6457";
const ACCENT = "#0f5c4d";

export function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = 50;
    const right = 545;

    // Header
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(20).text(data.seller.name, left, 50);
    doc.fillColor(MUTED).font("Helvetica").fontSize(9);
    doc.text(data.seller.address, left, 76, { width: 300 });
    doc.text(`GSTIN: ${data.seller.gstin}`, left, doc.y + 2);
    doc.text(`Email: ${data.seller.email}`, left, doc.y + 1);

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(16).text("TAX INVOICE", 350, 50, {
      width: 195,
      align: "right",
    });
    doc.font("Helvetica").fontSize(9).fillColor(MUTED);
    doc.text(`Invoice No: ${data.number}`, 350, 74, { width: 195, align: "right" });
    doc.text(`Date: ${data.issuedAt.toLocaleDateString("en-IN")}`, 350, doc.y + 1, {
      width: 195,
      align: "right",
    });

    // Divider
    doc.moveTo(left, 150).lineTo(right, 150).strokeColor("#d9d2c2").stroke();

    // Bill to
    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text("BILL TO", left, 165);
    doc.fillColor(INK).font("Helvetica").fontSize(11).text(data.buyer.name, left, 178);
    doc.fontSize(9).fillColor(MUTED).text(data.buyer.email, left, doc.y + 2);
    if (data.buyer.gstin) doc.text(`GSTIN: ${data.buyer.gstin}`, left, doc.y + 1);
    doc.text(`Place of supply: ${data.placeOfSupply}`, left, doc.y + 1);

    // Line item table
    const tableTop = 250;
    doc.rect(left, tableTop, right - left, 22).fill(ACCENT);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("Description", left + 8, tableTop + 6);
    doc.text("SAC", 320, tableTop + 6);
    doc.text("Taxable Value", 400, tableTop + 6, { width: 137, align: "right" });

    const rowY = tableTop + 30;
    doc.fillColor(INK).font("Helvetica").fontSize(10);
    doc.text(data.lineDescription, left + 8, rowY, { width: 260 });
    doc.text(data.sac, 320, rowY);
    doc.text(paiseToInr(data.subtotalPaise), 400, rowY, { width: 137, align: "right" });

    // Totals block
    let ty = rowY + 40;
    const labelX = 330;
    const valX = 400;
    const line = (label: string, value: string, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 10);
      doc.fillColor(bold ? INK : MUTED).text(label, labelX, ty, { width: 60, align: "left" });
      doc.fillColor(INK).text(value, valX, ty, { width: 137, align: "right" });
      ty += bold ? 20 : 16;
    };

    doc.moveTo(labelX, ty - 8).lineTo(right, ty - 8).strokeColor("#d9d2c2").stroke();
    line("Taxable", paiseToInr(data.subtotalPaise));
    if (data.isInterState) {
      line(`IGST @ ${data.gstRate}%`, paiseToInr(data.igstPaise));
    } else {
      line(`CGST @ ${data.gstRate / 2}%`, paiseToInr(data.cgstPaise));
      line(`SGST @ ${data.gstRate / 2}%`, paiseToInr(data.sgstPaise));
    }
    doc.moveTo(labelX, ty - 4).lineTo(right, ty - 4).strokeColor(INK).stroke();
    ty += 4;
    line("Total", paiseToInr(data.totalPaise), true);

    // Footer
    doc.fillColor(MUTED).font("Helvetica").fontSize(8);
    doc.text(
      "This is a computer-generated invoice and does not require a signature. " +
        "Subscription to a digital SaaS service (SAC " +
        data.sac +
        ").",
      left,
      760,
      { width: right - left, align: "center" },
    );

    doc.end();
  });
}
