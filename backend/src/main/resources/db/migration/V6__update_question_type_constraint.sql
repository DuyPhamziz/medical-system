-- Migration to update form_question_type check constraint
-- The current constraint restricts question types to a few legacy values.
-- We need to expand it to include all types defined in the QuestionType enum.

ALTER TABLE form_question DROP CONSTRAINT IF EXISTS form_question_question_type_check;

ALTER TABLE form_question ADD CONSTRAINT form_question_question_type_check 
CHECK (question_type IN (
    'TEXT', 'NUMBER', 'DATE', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 
    'SCALE', 'FILE_UPLOAD', 'MATRIX', 'CALCULATED', 'LOOKUP', 
    'PEDIGREE', 'DATETIME', 'TIME_SERIES', 'BODY_MAP'
));
