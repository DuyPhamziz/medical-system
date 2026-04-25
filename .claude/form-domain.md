# Form domain (observed)

## Core model
- `Form`
  - Metadata: `title`, `description`, `template`, `paid/price`, `publicForm`, `visibility`, `status`, `version`.
  - Ownership: `createdBy` (doctor context is implied by permissions).
  - Structure: ordered `sections[]`.
- `FormSection`
  - Ordered by `orderIndex`.
  - `allowRepeat` + optional `repeatLabel` (section-level repeating UI).
  - Contains ordered `questions[]`.
- `FormQuestion`
  - `questionType`: `TEXT|NUMBER|DATE|SINGLE_CHOICE|MULTIPLE_CHOICE|SCALE` (backend) mapped to `"text"|"number"|...` (frontend).
  - Validation/range fields exist but enforcement is `UNKNOWN` (not observed in backend service).
  - `allowRepeat` allows repeating answers per question.
- `FormQuestionOption`
  - Used for choice questions; has `score` and optional `triggerLogic` (JSON string).

## Repeating rules (current behavior)
- Frontend renderer repeats when `section.allowRepeat || question.allowRepeat`.
- Persistence uses `FormAnswer.repeatIndex`:
  - Each answer row is keyed by `(session_id, question_id, repeat_index)` conceptually (no explicit unique constraint observed).
  - Section repeats are represented indirectly by per-question `repeatIndex` (no dedicated section-repeat table).

## Conditional logic (current behavior)
- Stored in `form_question_option.trigger_logic` as JSON string.
- Frontend writes a single rule into the **first option** of a question (`LogicEditor`).
- Backend currently only stores/returns `triggerLogic`; runtime evaluation is `UNKNOWN`.

## Answer sessions (draft/submit)
- Draft and submit share the same pipeline (`FormService.saveAnswerSession`):
  - Creates/loads `AnswerSession` by `sessionId` if provided.
  - Deletes prior answers for the session and re-inserts all provided answers.
- Session fields
  - `status`: `DRAFT` vs `SUBMITTED` vs `VOID`.
  - `source`: `DOCTOR` if current auth has `DOCTOR`/`STAFF` authority substring match; else `PATIENT`.
  - `submittedBy` set only on submit.
- Scoring
  - Backend totals `option.score` when `optionId` is present; other answer types do not contribute.

