-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "lockExpire" TIMESTAMP(3),
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT;
