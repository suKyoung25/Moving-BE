/*
  Warnings:

  - You are about to drop the column `clientId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `moverId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_moverId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "clientId",
DROP COLUMN "moverId",
ADD COLUMN     "userId" TEXT NOT NULL;
