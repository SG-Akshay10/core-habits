-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('daily', 'weekly', 'monthly');

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "goal_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "goal_type" "GoalType" NOT NULL DEFAULT 'daily';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "week_start_day" INTEGER NOT NULL DEFAULT 0;
