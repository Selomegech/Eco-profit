/*
  Warnings:

  - Added the required column `periodEnd` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "buyerAddress" TEXT,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3);

-- Backfill existing rows from their linked subscription period.
UPDATE "Invoice" i
SET "periodStart" = COALESCE(s."currentPeriodStart", i."issuedAt"),
    "periodEnd" = COALESCE(s."currentPeriodEnd", i."issuedAt")
FROM "Subscription" s
WHERE s.id = i."subscriptionId";

-- Any remaining rows with no linked subscription fall back to issuedAt.
UPDATE "Invoice"
SET "periodStart" = COALESCE("periodStart", "issuedAt"),
    "periodEnd" = COALESCE("periodEnd", "issuedAt")
WHERE "periodStart" IS NULL OR "periodEnd" IS NULL;

ALTER TABLE "Invoice" ALTER COLUMN "periodStart" SET NOT NULL,
ALTER COLUMN "periodEnd" SET NOT NULL;
