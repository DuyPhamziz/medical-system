# System (Read-only analyst notes)

## Global rules for future agents
- DO: keep existing API paths, DTO shapes, entity/table mappings, and security rules intact.
- DO: follow existing role + permission model (`Role`, `Permission`, `RolePermissionMatrix`).
- DO NOT: change table/column names, enum values, UUID ID strategies, or `jsonb` column types.
- DO NOT: invent new layers/modules; if a module is not present, mark assumptions as `UNKNOWN`.
- If a repository/service behavior is referenced but implementation is not in the analyzed paths, mark `UNKNOWN`.

## Architecture summary (observed)
- Backend: Spring Boot REST API under `/api/**`, stateless JWT auth, method-level authorization via `@PreAuthorize`.
- Frontend: Next.js React client components (form builder/renderer) + `frontend/services/*.api.ts` API callers + `frontend/types/*`.
- Core domain in scope: dynamic Forms + Answer Sessions (draft/submit) with scoring.

## Hard constraints (API / DB / structure)
- Auth
  - JWT tokens contain `email`, `role`, and `permissions` claims (`JwtService`).
  - Backend expects `Authorization: Bearer <token>` for protected routes (`JwtAuthenticationFilter`).
- Forms
  - Public read endpoints are `GET /api/forms/public/**` (per `SecurityConfig` + `FormController`).
  - Form visibility is stored as `FormVisibility` (`PUBLIC`, `DOCTOR_ONLY`, `PRIVATE`) and also mirrored by `is_public` (`Form.publicForm`).
  - Conditional logic is stored as JSON string in `form_question_option.trigger_logic` (`jsonb`); runtime evaluation is `UNKNOWN` (not observed in backend).
- Database (inferred from JPA mappings)
  - UUID primary keys across entities (`@GeneratedValue(strategy = GenerationType.UUID)`).
  - PostgreSQL is likely because of `jsonb` column definitions, but actual DB vendor is `UNKNOWN`.

Respect existing API contract defined in .claude/api-contract.md