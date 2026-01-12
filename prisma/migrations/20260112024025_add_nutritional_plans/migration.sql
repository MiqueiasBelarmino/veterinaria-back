-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "plan_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration_in_months" INTEGER NOT NULL,
    "returns_included" INTEGER NOT NULL,
    "exam_return_counts" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "plan_definition_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "returns_used" INTEGER NOT NULL DEFAULT 0,
    "override_exam_return_counts" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_plan_definition_id_fkey" FOREIGN KEY ("plan_definition_id") REFERENCES "plan_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
