-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "allowDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowPickup" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deliveryPriceKm" DECIMAL(65,30),
ADD COLUMN     "pickupAddress" TEXT;
