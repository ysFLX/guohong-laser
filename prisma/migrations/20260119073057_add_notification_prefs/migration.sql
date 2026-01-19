-- AlterTable
ALTER TABLE "ReturnRequest" ALTER COLUMN "evidenceUrls" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPrefs" JSONB;

-- CreateTable
CREATE TABLE "CartReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "CartReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartReminder_email_key" ON "CartReminder"("email");

-- CreateIndex
CREATE INDEX "CartReminder_userId_idx" ON "CartReminder"("userId");

-- CreateIndex
CREATE INDEX "CartReminder_createdAt_idx" ON "CartReminder"("createdAt");

-- CreateIndex
CREATE INDEX "CartReminder_sentAt_idx" ON "CartReminder"("sentAt");

-- AddForeignKey
ALTER TABLE "CartReminder" ADD CONSTRAINT "CartReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
