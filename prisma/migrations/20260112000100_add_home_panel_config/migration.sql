-- CreateTable
CREATE TABLE "HomePanelConfig" (
    "id" TEXT NOT NULL,
    "capacitySchedule" JSONB NOT NULL,
    "priceAlertSteps" JSONB NOT NULL,
    "procurementFlow" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePanelConfig_pkey" PRIMARY KEY ("id")
);
