/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `isDone` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `confirmedAt` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromAddress` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moveDate` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moveType` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAddress` to the `Estimate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'DONE');

-- DropForeignKey
ALTER TABLE "Estimate" DROP CONSTRAINT "Estimate_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_moverId_fkey";

-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "createdAt",
DROP COLUMN "isDone",
DROP COLUMN "requestId",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fromAddress" TEXT NOT NULL,
ADD COLUMN     "isDesignated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moveDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "moveType" "MoveType" NOT NULL,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "toAddress" TEXT NOT NULL,
ALTER COLUMN "moverId" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;

-- DropTable
DROP TABLE "Request";

-- DropEnum
DROP TYPE "RequestStatus";
