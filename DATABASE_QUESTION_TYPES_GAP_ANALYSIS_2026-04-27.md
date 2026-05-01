# Database Gap Analysis For Question CRUD (PostgreSQL)

Date: 2026-04-27  
Database: `med_db` (schema `public`)  
Verification method: live PostgreSQL inspection (`psql`) + current backend mapping review.

## 1) Executive Summary

- Current DB can CRUD well for core question types: short text, number, single choice, multiple choice, date, and linear scale.
- Current DB partially supports: long paragraph, score-based question, pedigree data, repeatable question, conditional visibility, skippable question, lookup-like static dropdown.
- Current DB does not yet model strongly: matrix/table question, file/image upload answer, clinical standardized scale library, computed/calculated question, dynamic lookup/autocomplete source, datetime answer, time-series question model, body-map question, identity-question classification.
- Important architecture note: legacy form branch and v2 form branch coexist. New work should focus on v2 (`form_section`, `form_question`, `form_question_option`, `form_answer`) and only bridge legacy when needed.

## 2) Live Schema Evidence (What Exists Today)

### 2.1 Existing question type control in v2

- `form_question.question_type` is constrained by check:
  - `TEXT`, `NUMBER`, `DATE`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SCALE`
- Distinct live values currently used in data:
  - `TEXT`, `NUMBER`

### 2.2 Existing answer payload columns in v2

`form_answer` currently has:

- `value_text`
- `value_number`
- `value_date` (DATE only)
- `value_boolean`
- `value_json` (JSONB)
- optional `option_id`

### 2.3 Existing pedigree-related tables

- `family_member`
- `family_relationship`
- `family_member_disease`

These already allow storing family nodes, relations, and diseases, but are not yet tightly bound to form-question answer semantics.

## 3) Capability Matrix By Requested Question Type

Status legend:

- `ACHIEVED`: DB already supports CRUD directly.
- `PARTIAL`: can store, but lacks robust structure/constraints for production behavior.
- `MISSING`: needs new schema objects.

### 3.1 Câu hỏi trả lời ngắn

- Status: `ACHIEVED`
- Current support:
  - `form_question.question_type = TEXT`
  - answer in `form_answer.value_text`
- Needed adjustment:
  - Optional length validation at DB or service level if stricter limits are required.

### 3.2 Câu hỏi trả lời đoạn

- Status: `PARTIAL`
- Current support:
  - Same as short text (`TEXT` + `value_text`).
- Gap:
  - No explicit subtype (short vs paragraph).
- Recommendation:
  - Add `text_mode` (`SHORT`, `PARAGRAPH`) in `form_question`, or encode in `value_json` metadata.

### 3.3 Câu hỏi trắc nghiệm

- Status: `ACHIEVED`
- Current support:
  - `SINGLE_CHOICE`
  - options in `form_question_option`
  - selected option in `form_answer.option_id`

### 3.4 Câu hỏi trắc nghiệm nhiều đáp án (checkbox)

- Status: `ACHIEVED` (with implementation convention)
- Current support:
  - `MULTIPLE_CHOICE`
  - selected options can be saved in `form_answer.value_json` (array) and/or multiple rows.
- Recommendation:
  - Standardize one storage convention to avoid reporting inconsistency.

### 3.5 Câu hỏi cho phép tải tệp, hình ảnh

- Status: `MISSING`
- Gap:
  - No dedicated file answer table in v2.
- Recommendation:
  - Add table `form_answer_attachment`:
    - `attachment_id`, `answer_id`, `file_url`, `mime_type`, `file_size`, `storage_provider`, `checksum`, `uploaded_at`.
  - Add new question type `FILE_UPLOAD`.

### 3.6 Câu hỏi phạm vi tuyến tính

- Status: `ACHIEVED`
- Current support:
  - `SCALE`
  - `form_question.scale_min`, `scale_max`
  - answer in `value_number`

### 3.7 Câu hỏi thang điểm chuẩn hóa (clinical scale)

- Status: `PARTIAL`
- Current support:
  - option score (`form_question_option.score`)
  - session total (`answer_session.total_score`)
- Gap:
  - No reusable normalized scale definition/versioning.
- Recommendation:
  - Add:
    - `clinical_scale`
    - `clinical_scale_item`
    - `clinical_scale_interpretation` (score range -> risk/label)
  - Link `form_question` (or section/form) to a scale template.

### 3.8 Câu hỏi dạng bảng / ma trận

- Status: `MISSING`
- Gap:
  - No row/column schema for matrix question.
- Recommendation:
  - Add:
    - `form_question_matrix`
    - `form_question_matrix_row`
    - `form_question_matrix_column`
    - `form_answer_matrix_cell`
  - Add question type `MATRIX`.

### 3.9 Câu hỏi tính toán

- Status: `MISSING`
- Gap:
  - No formula expression model and no computed-value audit trail.
- Recommendation:
  - Add question type `CALCULATED`.
  - Add `form_question_formula`:
    - `question_id`, `expression`, `engine`, `rounding_rule`, `depends_on_question_ids`.
  - Add `form_answer.computed_from` JSONB or dedicated audit table.

### 3.10 Câu hỏi chọn từ dữ liệu có sẵn (lookup/dropdown/autocomplete)

- Status: `PARTIAL`
- Current support:
  - Static options via `form_question_option`.
- Gap:
  - No dynamic lookup source (table/api/filter).
- Recommendation:
  - Add question type `LOOKUP`.
  - Add `form_question_lookup_config`:
    - source type (`TABLE`, `API`), source key, label/value fields, search mode, pagination config.

### 3.11 Câu hỏi có tính điểm

- Status: `PARTIAL` to `ACHIEVED`
- Current support:
  - Per-option score and session total score.
- Gap:
  - No explicit per-question scoring policy (sum/max/weighted).
- Recommendation:
  - Add `form_question.scoring_rule` and optional `weight`.

### 3.12 Câu hỏi cây phả hệ (trả lời để vẽ cây)

- Status: `PARTIAL`
- Current support:
  - Separate family tables already exist.
- Gap:
  - Not scoped by answer session/form question.
  - Relationship constraints still permissive for graph consistency.
- Recommendation:
  - Add question type `PEDIGREE`.
  - Add bridge table `form_answer_pedigree` (`answer_id`, `patient_id` or `family_root_id`, snapshot/version metadata).
  - Tighten family constraints and indexes for deterministic graph rendering.

### 3.13 Câu hỏi ngày giờ

- Status: `PARTIAL`
- Current support:
  - `DATE` via `form_answer.value_date`.
- Gap:
  - Missing timestamp/datetime field.
- Recommendation:
  - Add `value_datetime TIMESTAMP` in `form_answer`.
  - Add question type `DATETIME` (or extend DATE behavior with precision config).

### 3.14 Nhóm câu hỏi lặp (lặp theo điều kiện/số lượng)

- Status: `PARTIAL`
- Current support:
  - `form_section.allow_repeat`, `form_question.allow_repeat`
  - `form_answer.repeat_index`
- Gap:
  - No first-class repeat-group definition and no repeat trigger policy table.
- Recommendation:
  - Add `form_repeat_group` and `form_repeat_group_item`.
  - Add repeat rule config (fixed count, condition expression, max repeats).

### 3.15 Câu hỏi điều kiện ẩn hiện + logic y khoa

- Status: `PARTIAL`
- Current support:
  - `form_question_option.trigger_logic` JSONB
- Gap:
  - Logic tied only to options; no general rule engine per question/section.
- Recommendation:
  - Add `form_logic_rule`:
    - scope (`QUESTION`, `SECTION`, `FORM`)
    - condition expression
    - action (`SHOW`, `HIDE`, `REQUIRE`, `CALCULATE`, `ALERT`)
    - priority and versioning
  - For medical logic, include clinical decision metadata (guideline source/version).

### 3.16 Câu hỏi có thể bỏ qua

- Status: `ACHIEVED`
- Current support:
  - `form_question.is_required` can be false.
  - Legacy model also has `question.allow_skip`.
- Recommendation:
  - Keep one canonical behavior in v2 to avoid divergence.

### 3.17 Câu hỏi theo thời gian

- Status: `MISSING` (as dedicated model)
- Gap:
  - No timeline/time-series structure for repeated temporal points.
- Recommendation:
  - Add `form_answer_timepoint`:
    - `answer_id`, `time_label`, `time_at`, value columns.
  - Add question type `TIME_SERIES`.

### 3.18 Câu hỏi đánh dấu vị trí cơ thể

- Status: `MISSING`
- Gap:
  - No spatial/body-map answer model.
- Recommendation:
  - Add question type `BODY_MAP`.
  - Add table `form_answer_body_marker`:
    - `answer_id`, `body_region_code`, `x`, `y`, `z`, `side`, `severity`, `note`.

### 3.19 Câu hỏi thông tin định danh

- Status: `PARTIAL`
- Current support:
  - Identity exists at patient/user domain tables, not question taxonomy.
- Gap:
  - No classification for PII-sensitive questions and masking policy.
- Recommendation:
  - Add `form_question.data_classification` (`PII`, `PHI`, `SENSITIVE`, `GENERAL`).
  - Add audit policy for access/masking when exporting answers.

## 4) What Is Already Achieved vs Not Yet

### 4.1 Achieved now

- Short text
- Single choice
- Multi choice (with agreed storage convention)
- Linear scale
- Skippable question
- Core scoring primitives (option score + session total)

### 4.2 Partial now

- Long paragraph subtype
- Clinical standardized scale
- Lookup dynamic source
- Pedigree question integration
- Datetime precision
- Repeat group semantics
- Conditional/medical logic engine
- Identity question governance

### 4.3 Missing now

- File/image upload answer model
- Matrix/table question model
- Calculated question model
- Dedicated time-series model
- Body-map marker model

## 5) Recommended Schema Adjustment Roadmap (No Code Yet)

### Phase 1 (high priority, low disruption)

1. Extend `question_type` check in v2 with: `FILE_UPLOAD`, `MATRIX`, `CALCULATED`, `LOOKUP`, `PEDIGREE`, `DATETIME`, `TIME_SERIES`, `BODY_MAP`.
2. Add `form_answer.value_datetime`.
3. Add `form_logic_rule` for conditional show/hide and medical logic.
4. Standardize multi-choice storage contract.

### Phase 2 (feature-complete structures)

1. Add matrix tables.
2. Add attachment tables for file/image answers.
3. Add lookup config table.
4. Add formula table for calculated questions.
5. Add repeat-group model.

### Phase 3 (clinical-depth and governance)

1. Add normalized clinical scale library tables.
2. Add body-map and time-series specialized answer tables.
3. Add data classification fields and masking/audit policy support.

## 6) Key Risks If Kept As-Is

1. Matrix, upload, computed, and body-map questions cannot be CRUDed consistently.
2. Logic rules in option JSON alone will become hard to version/validate.
3. Mixed legacy/v2 usage may produce inconsistent analytics and exports.
4. Pedigree data may be hard to reproduce per-answer snapshot without bridge model.

## 7) Decision Notes For Implementation Team

1. Treat v2 form tables as canonical write path.
2. Add new structures with backward-compatible migrations.
3. Keep old tables readable, avoid dual-write unless migration plan is explicit.
4. After schema changes, update this document and backend enum mappings together.
