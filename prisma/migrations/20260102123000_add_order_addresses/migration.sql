-- Add shipping/billing address references to Order
ALTER TABLE "Order" ADD COLUMN "shippingAddressId" TEXT;
ALTER TABLE "Order" ADD COLUMN "billingAddressId" TEXT;

-- Create indexes
CREATE INDEX "Order_shippingAddressId_idx" ON "Order"("shippingAddressId");
CREATE INDEX "Order_billingAddressId_idx" ON "Order"("billingAddressId");

-- Add foreign keys
ALTER TABLE "Order"
ADD CONSTRAINT "Order_shippingAddressId_fkey"
FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_billingAddressId_fkey"
FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
