# Coding style (observed)

## Java / Spring
- Packages use `com.healthcare.<layer>` with clear layering: `controller`, `service`, `repository`, `entity`, `security`, `config`, `dto`.
- Naming
  - Controllers: `*Controller`, services: `*Service`, repositories: `*Repository`, DTOs: `*Request` / `*Response`.
  - Enums are `UPPER_SNAKE` values (e.g., `FormStatus`, `QuestionType`).
- Patterns
  - Constructor injection (no field injection).
  - Transactions on service methods (`@Transactional`).
  - Central exception mapping via `GlobalExceptionHandler` returning `ApiErrorResponse`.

## TypeScript / React (Next.js)
- File naming
  - Components are kebab-case in `frontend/components/**` (e.g., `form-builder.tsx`).
  - API clients use `*.api.ts` in `frontend/services/`.
  - Domain types in `frontend/types/` using `export type ...`.
- Patterns
  - Client components explicitly declare `"use client"`.
  - Imports use alias `@/` for app-root modules.
  - Form builder maintains and normalizes `orderIndex` after reorder operations.
  - Prefer immutable updates (`map`, spreads) for nested updates.

## Practical rules for future codegen
- Keep backend `QuestionType` enum and frontend `FormQuestionType` union in sync (and any mapper logic).
- Do not change persistence fields without updating:
  - Backend DTOs (`FormUpsertRequest`, `FormResponse`, `AnswerSubmissionRequest`, `AnswerSessionResponse`)
  - Frontend types (`frontend/types/form.ts`) and mapping utilities (out of scope → `UNKNOWN`).
- Treat empty files as unfinished contracts:
  - `frontend/services/{patient,visit,cdss}.api.ts` and `frontend/types/{patient,visit}.ts` are empty → avoid generating code that depends on them without confirming requirements.

