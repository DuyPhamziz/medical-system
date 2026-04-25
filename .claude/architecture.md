# Architecture

## High-level design (observed)
- **Frontend (Next.js)**
  - UI lives in `frontend/components/**` (notably `frontend/components/form/**`).
  - HTTP clients live in `frontend/services/**` (`*.api.ts` files).
  - Shared DTO/types live in `frontend/types/**`.
- **Backend (Spring Boot)**
  - Controllers in `com.healthcare.controller` expose REST endpoints.
  - Services in `com.healthcare.service` contain business logic (`@Service`, `@Transactional`).
  - Persistence in `com.healthcare.entity` + `com.healthcare.repository` (Spring Data JPA).
  - Security in `com.healthcare.security` + `com.healthcare.config`.

## Frontend ↔ Backend flow (observed)
- Authentication
  - Frontend calls `/api/auth/*` via `fetch` (`frontend/services/auth.api.ts`) (BFF/proxy behavior is `UNKNOWN`).
  - Backend exposes `/api/auth/register|login|refresh` (`AuthController`).
  - After login, callers must attach `Authorization: Bearer <accessToken>` for protected backend endpoints.
- Forms
  - Public browse/load:
    - Frontend uses `env.apiBaseUrl` for public form endpoints (`frontend/services/form.api.ts`).
    - Backend serves `GET /api/forms/public` and `GET /api/forms/public/{formId}`.
  - Authenticated CRUD:
    - Frontend uses an axios client + BFF-style paths like `/forms/{id}` (`frontend/services/form.api.ts`).
    - Backend serves `/api/forms` CRUD + publish/archive + draft/submit + history (`FormController`).

## Form system overview (observed)
- Definition model: `Form` → `FormSection` → `FormQuestion` → `FormQuestionOption`.
- Fill/submit model: `AnswerSession` (draft/submitted/void) + `FormAnswer` rows.
- Scoring: backend totals `option.score` across submitted answers into `answer_session.total_score`.
- Conditional logic: stored in `FormQuestionOption.triggerLogic` as JSON string; evaluation/enforcement is `UNKNOWN` on backend.

