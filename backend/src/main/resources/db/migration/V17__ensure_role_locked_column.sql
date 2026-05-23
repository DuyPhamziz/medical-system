-- V17: Ensure role_locked column exists on user_account table.
-- This column was defined in V1 but may have been dropped or never created
-- on some database instances (e.g., when Hibernate ddl-auto created the table).
-- The User entity now maps this column properly (was @Transient, now @Column).

-- Step 1: Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_account'
          AND column_name = 'role_locked'
    ) THEN
        EXECUTE 'ALTER TABLE user_account ADD COLUMN role_locked BOOLEAN NOT NULL DEFAULT FALSE';
    END IF;
END $$;

-- Step 2: Backfill any NULL values (shouldn't exist, but safety check)
UPDATE user_account SET role_locked = FALSE WHERE role_locked IS NULL;

-- Step 3: Ensure NOT NULL constraint
ALTER TABLE user_account ALTER COLUMN role_locked SET NOT NULL;

-- Step 4: Ensure DEFAULT value
ALTER TABLE user_account ALTER COLUMN role_locked SET DEFAULT FALSE;
