/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,providerId]` on the table `Mover` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ESTIMATE_REJECTED';

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mover" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_provider_providerId_key" ON "Client"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_provider_providerId_key" ON "Mover"("provider", "providerId");
