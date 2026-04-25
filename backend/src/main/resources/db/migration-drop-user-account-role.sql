-- Migration: remove legacy user_account.role column and keep role_id as the single source of truth.
-- Safe to run multiple times.

BEGIN;

INSERT INTO role (role_id, role_name)
VALUES
    ('ADMIN', 'ADMIN'),
    ('DOCTOR', 'DOCTOR'),
    ('PATIENT', 'PATIENT'),
    ('STAFF', 'STAFF')
ON CONFLICT (role_id) DO NOTHING;

UPDATE user_account
SET role_id = role
WHERE role_id IS NULL
  AND role IS NOT NULL;

ALTER TABLE user_account
    ALTER COLUMN role_id SET NOT NULL;

ALTER TABLE user_account
    DROP COLUMN IF EXISTS role;

COMMIT;
