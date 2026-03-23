-- AlterTable
ALTER TABLE "ChordDocument"
ADD COLUMN "fileData" BYTEA,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "mimeType" TEXT;
