import type { Prisma } from "@prisma/client";
import { env } from "@/lib/env";

// Indian financial year runs Apr 1 – Mar 31. Invoice numbers reset per FY
// and must be a gapless monotonic sequence (GST requirement).
export function financialYearLabel(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth(); // 0 = Jan
  const startYear = m >= 3 ? y : y - 1; // Apr (index 3) onwards
  const endYY = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYY}`;
}

// Reserve the next invoice number atomically inside a transaction.
export async function nextInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const fyLabel = financialYearLabel();
  const counter = await tx.invoiceCounter.upsert({
    where: { fyLabel },
    create: { fyLabel, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });
  const seq = String(counter.lastValue).padStart(5, "0");
  return `${env.INVOICE_PREFIX}/${fyLabel}/${seq}`;
}
