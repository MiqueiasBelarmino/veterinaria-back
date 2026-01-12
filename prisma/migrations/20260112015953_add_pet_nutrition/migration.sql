-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "clinical_notes" TEXT,
ADD COLUMN     "is_neutered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sex" TEXT;
