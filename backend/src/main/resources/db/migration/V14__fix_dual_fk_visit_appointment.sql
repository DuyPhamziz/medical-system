-- V14: Drop conflicting FK constraints on visit and appointment that point to doctor table.
-- The JPA entities map doctor_id -> user_account(user_id) directly,
-- but manual FK constraints also reference doctor(doctor_id), causing INSERT failures.

-- Drop manual FK on appointment pointing to doctor table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'appointment_doctor_id_fkey'
          AND table_name = 'appointment'
    ) THEN
        EXECUTE 'ALTER TABLE appointment DROP CONSTRAINT appointment_doctor_id_fkey';
    END IF;
END $$;

-- Drop manual FK on visit pointing to doctor table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'visit_doctor_id_fkey'
          AND table_name = 'visit'
    ) THEN
        EXECUTE 'ALTER TABLE visit DROP CONSTRAINT visit_doctor_id_fkey';
    END IF;
END $$;
