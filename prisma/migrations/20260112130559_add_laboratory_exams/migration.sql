-- CreateEnum
CREATE TYPE "NutritionProtocol" AS ENUM ('BASIC', 'OBESITY', 'ENDOCRINE', 'CME', 'DIABETES');

-- CreateTable
CREATE TABLE "laboratory_exams" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "protocol" "NutritionProtocol" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "results" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_exams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "laboratory_exams" ADD CONSTRAINT "laboratory_exams_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_exams" ADD CONSTRAINT "laboratory_exams_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
