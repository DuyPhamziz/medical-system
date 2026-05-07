-- Migration to add PII and Data Classification fields for better security and audit
-- is_pii: Mark questions containing Personally Identifiable Information
-- data_classification: Tag questions (e.g., PHI, SENSITIVE, GENERAL)

ALTER TABLE form_question ADD COLUMN IF NOT EXISTS is_pii BOOLEAN DEFAULT FALSE;
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50) DEFAULT 'GENERAL';

-- Index for filtering by classification
CREATE INDEX IF NOT EXISTS idx_form_question_pii ON form_question(is_pii);
