-- V10: Multi-tenant support - Organization subscriptions and org_id isolation
-- Adds subscription management to organization table
-- Adds org_id foreign key to core tables for row-level tenant isolation

-- ================================================================
-- 1. Extend organization table with subscription fields
-- ================================================================
ALTER TABLE organization
    ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ================================================================
-- 2. Create org_subscription table (subscription history)
-- ================================================================
CREATE TABLE IF NOT EXISTS org_subscription (
    subscription_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organization(org_id),
    plan_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    payment_ref VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_subscription_org_id ON org_subscription(org_id);

-- ================================================================
-- 3. Create org_feature_flags table
-- ================================================================
CREATE TABLE IF NOT EXISTS org_feature_flags (
    flag_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organization(org_id),
    feature_key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    config_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_org_feature_flags_org_id ON org_feature_flags(org_id);

-- ================================================================
-- 4. Add org_id to core tables (all nullable for backward compatibility)
-- ================================================================

-- clinic: each clinic belongs to an organization
ALTER TABLE clinic
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_clinic_org_id ON clinic(org_id);

-- user_account: each user belongs to an org (NULL for platform super-admins)
ALTER TABLE user_account
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_user_account_org_id ON user_account(org_id);

-- form: each form belongs to an organization
ALTER TABLE form
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_form_org_id ON form(org_id);

-- patient: each patient belongs to an organization
ALTER TABLE patient
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_patient_org_id ON patient(org_id);

-- clinical_scale: scales can be org-specific or system-wide (NULL = system-wide)
ALTER TABLE clinical_scale
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_clinical_scale_org_id ON clinical_scale(org_id);

-- service: services/prices can be org-specific
ALTER TABLE service
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organization(org_id);
CREATE INDEX IF NOT EXISTS idx_service_org_id ON service(org_id);
