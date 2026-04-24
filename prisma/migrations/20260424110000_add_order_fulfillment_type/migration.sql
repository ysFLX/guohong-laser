CREATE TYPE "OrderFulfillmentType" AS ENUM ('SHIPPING', 'PICKUP');

ALTER TABLE "Order"
ADD COLUMN "fulfillmentType" "OrderFulfillmentType" NOT NULL DEFAULT 'SHIPPING';
