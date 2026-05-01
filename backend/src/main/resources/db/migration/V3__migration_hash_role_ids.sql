-- Migration: store hashed role_id values instead of plain role names.
-- Safe for DBs currently using ADMIN/DOCTOR/PATIENT/STAFF as role_id.

ALTER TABLE user_account DROP CONSTRAINT IF EXISTS user_account_role_id_fkey;

ALTER TABLE role
    ALTER COLUMN role_id TYPE VARCHAR(64);

ALTER TABLE user_account
    ALTER COLUMN role_id TYPE VARCHAR(64);

INSERT INTO role (role_id, role_name)
VALUES
    ('835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be', 'ADMIN'),
    ('0d8b1eaf613adfeff42e6fc12f168c188a8256fd509ef79c3e214fb0a4687109', 'DOCTOR'),
    ('0a935ec18ca52f08785c9c17d0160d1d62115348cc808392033fcef3e93c6d5c', 'PATIENT'),
    ('edeea48516c33a2436c2221f3078e54797d58710dcb3efd0417039d934d53b58', 'STAFF')
ON CONFLICT (role_id) DO UPDATE SET role_name = EXCLUDED.role_name;

UPDATE user_account
SET role_id = CASE role_id
    WHEN 'ADMIN' THEN '835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be'
    WHEN 'DOCTOR' THEN '0d8b1eaf613adfeff42e6fc12f168c188a8256fd509ef79c3e214fb0a4687109'
    WHEN 'PATIENT' THEN '0a935ec18ca52f08785c9c17d0160d1d62115348cc808392033fcef3e93c6d5c'
    WHEN 'STAFF' THEN 'edeea48516c33a2436c2221f3078e54797d58710dcb3efd0417039d934d53b58'
    ELSE role_id
END;

DELETE FROM role
WHERE role_id IN ('ADMIN', 'DOCTOR', 'PATIENT', 'STAFF');

ALTER TABLE user_account
    ADD CONSTRAINT user_account_role_id_fkey
    FOREIGN KEY (role_id) REFERENCES role(role_id);
