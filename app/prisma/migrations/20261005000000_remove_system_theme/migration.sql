UPDATE "users" SET "theme" = 'light' WHERE "theme" = 'system';

ALTER TABLE "users" ALTER COLUMN "theme" SET DEFAULT 'light';
