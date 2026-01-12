-- CreateTable
CREATE TABLE "dietary_plans" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dietary_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "dietary_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_items" (
    "id" TEXT NOT NULL,
    "meal_id" TEXT NOT NULL,
    "food_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "frequency" TEXT,
    "notes" TEXT,

    CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dietary_plans" ADD CONSTRAINT "dietary_plans_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dietary_plans" ADD CONSTRAINT "dietary_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_dietary_plan_id_fkey" FOREIGN KEY ("dietary_plan_id") REFERENCES "dietary_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
