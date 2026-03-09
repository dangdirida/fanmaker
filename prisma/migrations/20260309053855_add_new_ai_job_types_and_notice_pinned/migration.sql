-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AIJobType" ADD VALUE 'CONCEPT_GENERATE';
ALTER TYPE "AIJobType" ADD VALUE 'IDOL_PROJECT';
ALTER TYPE "AIJobType" ADD VALUE 'GLOBAL_TRANSCRIBE';
ALTER TYPE "AIJobType" ADD VALUE 'GLOBAL_TRANSLATE';

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;
