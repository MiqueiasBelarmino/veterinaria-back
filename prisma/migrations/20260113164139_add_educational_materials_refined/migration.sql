-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('EBOOK', 'RECIPE', 'GUIDELINE');

-- CreateTable
CREATE TABLE "educational_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MaterialType" NOT NULL,
    "content" TEXT,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppointmentMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppointmentMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PetMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PetMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlanDefinitionMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlanDefinitionMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AppointmentMaterials_B_index" ON "_AppointmentMaterials"("B");

-- CreateIndex
CREATE INDEX "_PetMaterials_B_index" ON "_PetMaterials"("B");

-- CreateIndex
CREATE INDEX "_PlanDefinitionMaterials_B_index" ON "_PlanDefinitionMaterials"("B");

-- AddForeignKey
ALTER TABLE "_AppointmentMaterials" ADD CONSTRAINT "_AppointmentMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentMaterials" ADD CONSTRAINT "_AppointmentMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetMaterials" ADD CONSTRAINT "_PetMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PetMaterials" ADD CONSTRAINT "_PetMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanDefinitionMaterials" ADD CONSTRAINT "_PlanDefinitionMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "educational_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlanDefinitionMaterials" ADD CONSTRAINT "_PlanDefinitionMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "plan_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
