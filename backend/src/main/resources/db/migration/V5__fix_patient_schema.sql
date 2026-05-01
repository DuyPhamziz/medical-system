-- Migration to fix schema-validation error: missing column [emergency_contact_name] in table [patient]
-- This happens because the JPA entity 'Patient' has more fields than the current 'patient' table in DB.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='biological_gender') THEN
        ALTER TABLE patient ADD COLUMN biological_gender VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='psychological_gender') THEN
        ALTER TABLE patient ADD COLUMN psychological_gender VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='national_id') THEN
        ALTER TABLE patient ADD COLUMN national_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='health_insurance_number') THEN
        ALTER TABLE patient ADD COLUMN health_insurance_number VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='occupation') THEN
        ALTER TABLE patient ADD COLUMN occupation VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='emergency_contact_name') THEN
        ALTER TABLE patient ADD COLUMN emergency_contact_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='emergency_contact_phone') THEN
        ALTER TABLE patient ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='status') THEN
        ALTER TABLE patient ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
    END IF;

    -- Handle phone to phone_number rename
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='phone') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient' AND column_name='phone_number') THEN
            ALTER TABLE patient RENAME COLUMN phone TO phone_number;
        ELSE
            -- Both exist? Maybe drop old one or just do nothing. 
            -- Safest is to do nothing if phone_number already exists.
            NULL;
        END IF;
    END IF;
END $$;
