/*
  Warnings:

  - You are about to drop the column `keySignature` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `tuning` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "keySignature",
DROP COLUMN "tuning";
