-- CreateEnum
CREATE TYPE "AddressInvoiceType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "InvoiceProvider" AS ENUM ('MIKRO_EPORTAL');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PROCESSING', 'ISSUED', 'FAILED');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "identityNumber" TEXT,
ADD COLUMN     "invoiceType" "AddressInvoiceType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "taxOffice" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "InvoiceProvider" NOT NULL DEFAULT 'MIKRO_EPORTAL',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "snapshot" JSONB,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "errorMessage" TEXT,
    "issuedAt" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "ettn" TEXT,
    "pdfObjectPath" TEXT,
    "xmlObjectPath" TEXT,
    "providerPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_nextAttemptAt_idx" ON "Invoice"("nextAttemptAt");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
