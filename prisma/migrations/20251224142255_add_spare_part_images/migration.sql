-- CreateTable
CREATE TABLE "SparePartImage" (
    "id" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparePartImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SparePartImage_sparePartId_idx" ON "SparePartImage"("sparePartId");

-- CreateIndex
CREATE INDEX "SparePartImage_sortOrder_idx" ON "SparePartImage"("sortOrder");

-- AddForeignKey
ALTER TABLE "SparePartImage" ADD CONSTRAINT "SparePartImage_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "SparePart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
