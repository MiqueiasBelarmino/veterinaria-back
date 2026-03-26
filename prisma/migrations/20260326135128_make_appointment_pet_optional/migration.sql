-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pet_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "pet_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
