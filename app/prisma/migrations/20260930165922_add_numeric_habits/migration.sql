-- AlterTable
ALTER TABLE "habit_logs" ADD COLUMN     "value" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "is_numeric" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "unit_label" TEXT;
