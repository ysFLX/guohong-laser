CREATE TABLE "SparePartReview" (
    "id" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SparePartReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SparePartReview_userId_sparePartId_key" ON "SparePartReview"("userId", "sparePartId");
CREATE INDEX "SparePartReview_sparePartId_createdAt_idx" ON "SparePartReview"("sparePartId", "createdAt");
CREATE INDEX "SparePartReview_userId_idx" ON "SparePartReview"("userId");

ALTER TABLE "SparePartReview" ADD CONSTRAINT "SparePartReview_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "SparePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SparePartReview" ADD CONSTRAINT "SparePartReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
