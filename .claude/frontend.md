# Frontend (Next.js)

## Structure in scope (observed)
- `frontend/components/`
  - `form/*`: form builder + renderer + editors (heavy client-side logic; `use client`).
  - `ui/*`: basic UI primitives (`button`, `input`, `modal`, `table`).
  - `marketing/*`: site shell/navbar/swiper.
- `frontend/services/`
  - `auth.api.ts`, `admin.api.ts`, `form.api.ts` implemented.
  - `patient.api.ts`, `visit.api.ts`, `cdss.api.ts` are empty (0 bytes) → `UNKNOWN`/unfinished.
- `frontend/types/`
  - `form.ts`, `form-builder.ts`, `user.ts` implemented.
  - `patient.ts`, `visit.ts`, `cdss.ts` are empty or partial → `UNKNOWN`/unfinished.

## Component patterns (observed)
- Form builder (`frontend/components/form/form-builder.tsx`)
  - Local state via `useState` for `FormDefinition`.
  - Reorders sections/questions/options via `@dnd-kit/*` and normalizes `orderIndex` after moves.
  - Generates client UUIDs (`crypto.randomUUID()`) for new sections/questions/options before persistence.
  - Visibility handled via `VisibilityToggle` which also toggles `publicForm`.
- Form renderer (`frontend/components/form/form-renderer.tsx`)
  - Maintains an `answers` nested state keyed by `questionId` and `repeatIndex`.
  - Flattens state to backend-compatible `FormAnswerValue[]` (questionId/optionId/repeatIndex + value* fields).
  - Multiple choice stored in `valueJson` as JSON array string (fallback: comma split parsing).
- Conditional logic editor (`frontend/components/form/logic-editor.tsx`)
  - Stores rule JSON in the **first option**’s `triggerLogic` for compatibility with backend schema.
  - Backend enforcement is `UNKNOWN`; treat `triggerLogic` as persisted metadata unless proven otherwise.

## State management (observed)
- Mostly local component state (`useState`, `useMemo`).
- There is an import `@/store/form-builder.store` in `builder-sidebar.tsx`, but store implementation is out of scope → `UNKNOWN` (likely Zustand or similar).

## API calling patterns (observed)
- Auth service uses `fetch("/api/auth/...")` (implies Next.js API routes/BFF, but mapping is `UNKNOWN`).
- Form service mixes:
  - Direct calls to `${env.apiBaseUrl}/forms/public...` for public endpoints.
  - Axios calls to `/forms...` for authenticated endpoints (axios baseURL behavior is `UNKNOWN`).

