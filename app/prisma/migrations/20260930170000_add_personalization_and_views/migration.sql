-- AlterTable
ALTER TABLE "users" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "default_view" TEXT NOT NULL DEFAULT 'cards';

-- AlterTable
ALTER TABLE "habits" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "archived_at" TIMESTAMP(3);
