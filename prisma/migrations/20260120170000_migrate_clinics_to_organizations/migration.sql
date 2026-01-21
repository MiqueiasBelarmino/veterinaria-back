-- Migrate existing Clinics to Organizations
-- This will create an Organization entry for each existing Clinic
-- and link the vets accordingly

DO $$
DECLARE
    v_clinic_record RECORD;
    v_org_id TEXT;
    v_owner_user_id TEXT;
    v_vet_record RECORD;
BEGIN
    -- Loop through all existing clinics
    FOR v_clinic_record IN SELECT id, name, address, phone, created_at, updated_at FROM "clinics" LOOP
        v_org_id := 'org_' || v_clinic_record.id;
        
        -- Find the first vet in this clinic to be the owner
        SELECT user_id INTO v_owner_user_id FROM "vets" 
        WHERE clinic_id = v_clinic_record.id ORDER BY created_at ASC LIMIT 1;
        
        -- Insert Organization from Clinic
        INSERT INTO "organizations" (id, name, type, address, phone, owner_id, is_physical_location, created_at, updated_at)
        VALUES (
            v_org_id,
            v_clinic_record.name,
            'clinic'::text,
            v_clinic_record.address,
            v_clinic_record.phone,
            v_owner_user_id,
            true,
            v_clinic_record.created_at,
            v_clinic_record.updated_at
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Update all vets in this clinic to have organization_id
        UPDATE "vets" SET "organization_id" = v_org_id 
        WHERE clinic_id = v_clinic_record.id AND "organization_id" IS NULL;
        
        -- Create OrganizationMember entries for all vets in this clinic
        FOR v_vet_record IN 
            SELECT id, user_id FROM "vets" WHERE clinic_id = v_clinic_record.id
        LOOP
            INSERT INTO "organization_members" (id, organization_id, user_id, role, created_at, updated_at)
            VALUES (
                gen_random_uuid()::text,
                v_org_id,
                v_vet_record.user_id,
                CASE WHEN v_vet_record.user_id = v_owner_user_id THEN 'owner' ELSE 'vet' END,
                NOW(),
                NOW()
            )
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
