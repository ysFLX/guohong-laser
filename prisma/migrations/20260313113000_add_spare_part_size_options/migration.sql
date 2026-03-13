ALTER TABLE "SparePart"
ADD COLUMN "hasSizeOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sizeOptions" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "SparePart"
SET "hasSizeOptions" = false,
    "sizeOptions" = ARRAY[]::TEXT[]
WHERE "hasSizeOptions" IS NULL
   OR "sizeOptions" IS NULL;
