/*
  Warnings:

  - You are about to drop the column `plan_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `clinical_records` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `dietary_plans` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `laboratory_exams` table. All the data in the column will be lost.
  - You are about to drop the `_PlanDefinitionMaterials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_definitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlanDefinitionMaterials" DROP CONSTRAINT "_PlanDefinitionMaterials_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlanDefinitionMaterials" DROP CONSTRAINT "_PlanDefinitionMaterials_B_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "clinical_records" DROP CONSTRAINT "clinical_records_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "dietary_plans" DROP CONSTRAINT "dietary_plans_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "laboratory_exams" DROP CONSTRAINT "laboratory_exams_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_plan_definition_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "plan_id";

-- AlterTable
ALTER TABLE "clinical_records" DROP COLUMN "plan_id";

-- AlterTable
ALTER TABLE "dietary_plans" DROP COLUMN "plan_id";

-- AlterTable
ALTER TABLE "laboratory_exams" DROP COLUMN "plan_id";

-- DropTable
DROP TABLE "_PlanDefinitionMaterials";

-- DropTable
DROP TABLE "plan_definitions";

-- DropTable
DROP TABLE "plans";

-- DropEnum
DROP TYPE "PlanStatus";
