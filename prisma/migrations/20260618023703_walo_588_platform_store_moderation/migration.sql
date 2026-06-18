-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'PLATFORM_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "StoreAuditLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhipuLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "context" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KhipuLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreAuditLog_storeId_idx" ON "StoreAuditLog"("storeId");

-- CreateIndex
CREATE INDEX "StoreAuditLog_actorId_idx" ON "StoreAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "StoreAuditLog_action_idx" ON "StoreAuditLog"("action");

-- CreateIndex
CREATE INDEX "KhipuLog_orderId_idx" ON "KhipuLog"("orderId");

-- AddForeignKey
ALTER TABLE "StoreAuditLog" ADD CONSTRAINT "StoreAuditLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreAuditLog" ADD CONSTRAINT "StoreAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
