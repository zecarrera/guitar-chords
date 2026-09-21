-- AlterTable
ALTER TABLE "Song" ADD COLUMN "strummingPattern" TEXT;

-- Preserve existing strumming values that were stored in the legacy column.
UPDATE "Song"
SET "strummingPattern" = "difficulty"
WHERE "difficulty" IS NOT NULL;

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "difficulty";
