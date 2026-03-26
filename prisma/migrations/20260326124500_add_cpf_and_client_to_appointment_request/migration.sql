-- AlterTable: Add cpf to clients
ALTER TABLE "clients" ADD COLUMN "cpf" TEXT;

-- CreateIndex: Unique constraint on cpf
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- AlterTable: Add ownerCpf and clientId to appointment_requests
ALTER TABLE "appointment_requests" ADD COLUMN "owner_cpf" TEXT;
ALTER TABLE "appointment_requests" ADD COLUMN "client_id" TEXT;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
