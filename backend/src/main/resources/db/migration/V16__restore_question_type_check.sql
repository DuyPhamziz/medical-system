-- V16: Re-add CHECK constraint on form_question.question_type
-- V11 dropped the constraint to allow DYNAMIC_TABLE, but never recreated it.
-- This migration adds the constraint back with all current valid types.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_form_question_type'
          AND conrelid = 'form_question'::regclass
    ) THEN
        EXECUTE $ex$
            ALTER TABLE form_question
            ADD CONSTRAINT chk_form_question_type
            CHECK (question_type IN (
                'TEXT', 'NUMBER', 'DATE', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE',
                'SCALE', 'SCORED', 'MATRIX', 'DYNAMIC_TABLE',
                'BODY_MAP', 'PEDIGREE', 'FILE_UPLOAD', 'LOOKUP',
                'IDENTITY', 'GROUP', 'REPEATABLE_GROUP', 'TIME_SERIES',
                'CLINICAL_SCALE', 'CALCULATED'
            ))
        $ex$;
    END IF;
END $$;
