/*
  Warnings:

  - You are about to drop the column `deliveryPriceKm` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "deliveryPriceKm",
ADD COLUMN     "deliveryCost" INTEGER NOT NULL DEFAULT 0;
