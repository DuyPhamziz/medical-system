-- Migration to add new medical question types
-- CLINICAL_SCALE: integrated standardized assessment scales (PHQ-9, GAD-7)
-- SCORED: question with score categories/tiers and auto-interpretation
-- REPEATABLE_GROUP: dynamic repeatable group of sub-questions
-- IDENTITY: structured demographic/identity fields (CMND/CCCD, ethnicity, etc.)

ALTER TABLE form_question DROP CONSTRAINT IF EXISTS form_question_question_type_check;

ALTER TABLE form_question ADD CONSTRAINT form_question_question_type_check
CHECK (question_type IN (
    'TEXT', 'NUMBER', 'DATE', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE',
    'SCALE', 'FILE_UPLOAD', 'MATRIX', 'CALCULATED', 'LOOKUP',
    'PEDIGREE', 'DATETIME', 'TIME_SERIES', 'BODY_MAP',
    'CLINICAL_SCALE', 'SCORED', 'REPEATABLE_GROUP', 'IDENTITY'
));

-- Add scale_id to form_question for CLINICAL_SCALE type (nullable, references clinical_scale)
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS scale_id UUID REFERENCES clinical_scale(scale_id);

-- Add score_categories to form_question for SCORED type (JSONB stored in config_json)
-- config_json for SCORED: { "categories": [{"min":0,"max":4,"label":"None","severity":"NORMAL"}, ...] }

-- Add child_questions_config to form_question for REPEATABLE_GROUP type
-- config_json for REPEATABLE_GROUP: { "childQuestions": [...], "maxInstances": 10, "minInstances": 1 }

-- Add identity_fields to form_question for IDENTITY type
-- config_json for IDENTITY: { "fields": ["fullName","dob","gender","identityNumber","ethnicity","occupation","phone","address"] }

-- Add index on scale_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_question_scale_id ON form_question(scale_id);
