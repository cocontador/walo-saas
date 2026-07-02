-- AlterTable
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Backfill: productos existentes reciben su id como slug para mantener URLs funcionales
UPDATE "Product" SET "slug" = "id";

-- CreateIndex: slug único por tienda
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");
