-- CreateEnum
CREATE TYPE "HabitType" AS ENUM ('build', 'quit');

-- AlterTable
ALTER TABLE "habit_logs" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" "HabitType" NOT NULL DEFAULT 'build';
