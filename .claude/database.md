# Database (from JPA mappings in `com.healthcare.entity`)

## Tables and key columns (observed)
- `user_account`
  - `user_id` (UUID PK), `email` (unique), `username`, `password`, `created_at`
  - `role_id` stored via `RoleIdConverter` (hash-like string IDs, not enum name)
  - `roleLocked` is `@Transient` (not mapped) → persistence of role-locking is `UNKNOWN`
- `patient`
  - `patient_id` (UUID PK), `full_name`, `created_at`, `user_id` (1:1 to `user_account`, nullable in mapping)
- `form`
  - `form_id` (UUID PK), `title`, `description`, `is_template`, `is_public`, `is_paid`, `price`
  - `status` (`DRAFT|PUBLISHED|ARCHIVED`), `visibility` (`PUBLIC|DOCTOR_ONLY|PRIVATE`)
  - `version`, `published_at`, `created_at`, `updated_at`, `created_by` (FK to `user_account`)
- `form_section`
  - `section_id` (UUID PK), `form_id` (FK), `title`, `description`, `order_index`
  - `allow_repeat`, `repeat_label`, `created_at`, `updated_at`
- `form_question`
  - `question_id` (UUID PK), `section_id` (FK), `content` (TEXT)
  - `question_type` (`TEXT|NUMBER|DATE|SINGLE_CHOICE|MULTIPLE_CHOICE|SCALE`)
  - validation/range fields, `allow_repeat`, `is_required`, `order_index`, timestamps
- `form_question_option`
  - `option_id` (UUID PK), `question_id` (FK), `content` (TEXT), `score`, `order_index`
  - `trigger_logic` (`jsonb` string stored by application)
- `answer_session`
  - `session_id` (UUID PK), `form_id` (FK), `patient_id` (FK), `visit_id` (UUID nullable)
  - `status` (`DRAFT|SUBMITTED|VOID`), `source` (`PATIENT|DOCTOR`)
  - `started_at`, `submitted_at`, `last_saved_at`, `submitted_by` (FK to `user_account`, nullable)
  - `total_score`
- `form_answer`
  - `answer_id` (UUID PK), `session_id` (FK), `question_id` (FK), `option_id` (FK nullable)
  - `repeat_index`, typed value fields (`value_text`, `value_number`, `value_date`, `value_boolean`, `value_json` (`jsonb`)), `created_at`
- `role` (table referenced by seed runner)
  - Inserted via `AdminSeedRunner.ensureRolesExist()` as (`role_id`, `role_name`) → entity mapping is `UNKNOWN`.

## Relationships (observed)
- `Form.createdBy` → `User` (many forms per user).
- `Form.sections` → `FormSection` (1:N, cascade all, orphan removal).
- `FormSection.questions` → `FormQuestion` (1:N, cascade all, orphan removal).
- `FormQuestion.options` → `FormQuestionOption` (1:N, cascade all, orphan removal).
- `AnswerSession.form` → `Form` (N:1).
- `AnswerSession.patient` → `Patient` (N:1).
- `AnswerSession.answers` → `FormAnswer` (1:N, cascade all, orphan removal).
- `FormAnswer.question` → `FormQuestion` (N:1), `FormAnswer.option` → `FormQuestionOption` (N:1 nullable).

## Rules for extending the DB (non-breaking)
- Prefer additive migrations only:
  - Add new nullable columns or columns with safe defaults.
  - Do not change existing enum values or column types (`jsonb`, UUID, `precision/scale`).
- Preserve cascade/orphan-removal semantics:
  - `FormService.applyStructure()` clears and rebuilds nested collections; DB must allow deletes via cascade.
- Role IDs are not enum names:
  - `role_id` values are fixed strings from `Role.getDbId()`; do not regenerate them.
- If changing form/answer payload shape:
  - Ensure both backend DTOs and frontend types/mappers are updated together (mappers are out of scope here → `UNKNOWN`).

