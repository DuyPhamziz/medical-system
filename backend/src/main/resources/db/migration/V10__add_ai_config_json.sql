-- Migration to add AI configuration support to questions
-- ai_config_json: Store manual configuration for AI indicators, scoring rules, and risk thresholds

ALTER TABLE form_question ADD COLUMN IF NOT EXISTS ai_config_json JSONB;

-- Comment for documentation
COMMENT ON COLUMN form_question.ai_config_json IS 'Stores AI-specific metadata like indicator mapping, scoring weights, and decision support rules';
