DO $$ BEGIN
    CREATE TYPE "ReturnStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "orderId" TEXT NOT NULL,
    "itemName" TEXT,
    "reason" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "evidenceUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "adminNote" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");
CREATE INDEX "ReturnRequest_createdAt_idx" ON "ReturnRequest"("createdAt");
CREATE INDEX "ReturnRequest_email_idx" ON "ReturnRequest"("email");
CREATE INDEX "ReturnRequest_userId_idx" ON "ReturnRequest"("userId");
CREATE INDEX "ReturnRequest_respondedByUserId_idx" ON "ReturnRequest"("respondedByUserId");

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReturnRequest"
ADD CONSTRAINT "ReturnRequest_respondedByUserId_fkey"
FOREIGN KEY ("respondedByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
