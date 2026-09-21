-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_PENDING';

-- AlterTable
ALTER TABLE "cash_incomes" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" TEXT;
