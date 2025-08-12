-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CANCELD';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "images" TEXT[];
