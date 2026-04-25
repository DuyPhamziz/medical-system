# Backend (Spring Boot)

## Package structure (observed)
- `com.healthcare.controller`: `AuthController`, `AdminController`, `DoctorController`, `PatientController`, `FormController`
- `com.healthcare.service`: `AuthService`, `FormService`
- `com.healthcare.entity`: JPA entities + enums (`Form*`, `AnswerSession*`, `User`, `Patient`, etc.)
- `com.healthcare.repository`: Spring Data repositories
- `com.healthcare.security`: JWT, permissions, form-level access checks
- `com.healthcare.config`: security filter chain, CORS, exception handling, seed runner

## Persistence patterns (observed)
- Repositories extend `JpaRepository<..., UUID>`.
- `AnswerSessionRepository` uses `@EntityGraph` to eager-load full form + answers graph.
- `FormRepository` declares `findWithGraphByFormId(UUID)` but its implementation/graph loading mechanism is `UNKNOWN` within the analyzed paths (likely custom or a missing annotation/fragment).

## API patterns (observed)
- Base path: `/api`
- Auth: `/api/auth/register|login|refresh` (public).
- Admin: `/api/admin/**` protected by `hasRole('ADMIN')` (plus permission checks on some endpoints).
- Forms: `/api/forms/**`
  - Public read: `GET /api/forms/public`, `GET /api/forms/public/{formId}`
  - Staff/doctor/admin list/get: `GET /api/forms`, `GET /api/forms/{formId}`
  - Doctor-only mutations: `POST /api/forms`, `PUT /api/forms/{id}`, `DELETE /api/forms/{id}`, `POST /api/forms/{id}/publish`
  - Archive/unarchive: `POST /api/forms/{id}/archive|unarchive`
  - Fill: `POST /api/forms/{id}/draft|submit` (doctor/staff/patient)
  - Patient history: `GET /api/forms/history` (patient)

## Security model (observed)
- Stateless JWT (`SecurityConfig`, `JwtAuthenticationFilter`, `JwtService`).
- Authorities:
  - Role authority: `ROLE_<Role>` (`CustomUserDetailsService`).
  - Permission authorities: permission enum names (from `RolePermissionMatrix`).
- Form-level access logic:
  - Centralized in `FormPermissionService` (view/edit/delete/publish/archive/fill/answers rules).
  - Controllers still apply coarse `@PreAuthorize`; service enforces finer-grained checks.

## Service responsibilities (observed)
- `AuthService`
  - Self-register restricted to `PATIENT`.
  - Admin creates users and assigns roles.
  - JWT issuance (access + refresh).
  - Note: `User.roleLocked` is `@Transient` in the entity; persistence behavior is `UNKNOWN`/potentially inconsistent.
- `FormService`
  - Owns full lifecycle: create/update/delete/publish/archive/unarchive/list/get.
  - Upsert structure behavior: clears `form.sections` and rebuilds sections/questions/options from request (`applyStructure`).
  - Saving answers:
    - Creates/updates `AnswerSession`, then deletes prior `FormAnswer` rows for that session and re-inserts all answers.
    - Calculates `totalScore` by summing selected option scores.
