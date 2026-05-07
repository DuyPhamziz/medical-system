-- Migration to support Advanced Question Types and Nested Structures
-- 1. Add DYNAMIC_TABLE to QuestionType enum (implicit in VARCHAR check)
-- 2. Add parent_question_id for sub-questions (nested questions)
-- 3. Add parent_option_id for option-triggered sub-questions

ALTER TABLE form_question ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES form_question(question_id);
ALTER TABLE form_question ADD COLUMN IF NOT EXISTS parent_option_id UUID REFERENCES form_question_option(option_id);

-- Add index for nested question lookups
CREATE INDEX IF NOT EXISTS idx_form_question_parent ON form_question(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_form_question_option_parent ON form_question(parent_option_id);

-- Update the check constraint for question_type if it exists
-- Note: Some environments might not have the constraint or it might be named differently
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'form_question' AND column_name = 'question_type') THEN
        ALTER TABLE form_question DROP CONSTRAINT IF EXISTS form_question_question_type_check;
    END IF;
END $$;
