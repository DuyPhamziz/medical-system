# MED Database Guide For AI Agents (Live PostgreSQL)

## 1) Source of truth
This document is based on LIVE PostgreSQL inspection (not static .sql files).

- DB: med_db
- Schema: public
- Snapshot date: 2026-04-26
- Total tables: 36

Use this file as canonical reference when generating backend/frontend code.

## 2) Live table inventory (alphabetical)
answer, answer_session, answer_value, appointment, clinic, doctor, family_member,
family_member_disease, family_relationship, form, form_answer, form_question,
form_question_option, form_section, form_type, invoice, invoice_detail, medication,
option_choice, organization, organization_member, patient, payment, payment_method,
payment_status, prescription, prescription_detail, question, question_type, role,
room, section, section_question, service, user_account, visit.

## 3) Core modules and table groups

### 3.1 Auth and identity
- role
- user_account
- doctor (links to user_account)
- patient (links to user_account)
- organization, organization_member

Key relation:
- user_account.role_id -> role.role_id

### 3.2 Clinical operations
- clinic -> room
- appointment (doctor + patient + room)
- visit (doctor + room)

### 3.3 Prescription and billing
- medication
- prescription -> prescription_detail
- service
- invoice -> invoice_detail
- payment + payment_method + payment_status

### 3.4 Family history
- family_member
- family_relationship
- family_member_disease

### 3.5 Form engine (legacy + new coexist)
Legacy branch:
- form, section, question, option_choice
- section_question
- answer, answer_value, answer_session

New branch (v2 style):
- form_section, form_question, form_question_option
- form_answer
- answer_session (shared)

Important: database currently contains BOTH legacy and v2 form structures at the same time.

## 4) Keys and cardinality that matter most

### 4.1 Primary keys
- Mostly single-column UUID PKs.
- Composite PKs:
  - prescription_detail (medication_id, prescription_id)
  - section_question (question_id, section_id)

### 4.2 High-impact foreign keys
- user_account.role_id -> role.role_id
- doctor.user_id -> user_account.user_id
- patient.user_id -> user_account.user_id
- organization_member.org_id -> organization.org_id
- organization_member.user_id -> user_account.user_id
- room.clinic_id -> clinic.clinic_id
- appointment.doctor_id -> doctor.doctor_id
- appointment.patient_id -> patient.patient_id
- appointment.room_id -> room.room_id
- visit.doctor_id -> doctor.doctor_id
- visit.room_id -> room.room_id
- prescription.visit_id -> visit.visit_id
- prescription_detail.prescription_id -> prescription.prescription_id
- prescription_detail.medication_id -> medication.medication_id
- invoice.visit_id -> visit.visit_id
- invoice_detail.invoice_id -> invoice.invoice_id
- invoice_detail.service_id -> service.service_id
- payment.user_id -> user_account.user_id
- payment.method_id -> payment_method.method_id
- payment.status_id -> payment_status.status_id

Form-related FKs (both branches):
- section.form_id -> form.form_id
- section_question.section_id -> section.section_id
- section_question.question_id -> question.question_id
- option_choice.question_id -> question.question_id
- answer.session_id -> answer_session.session_id
- answer.question_id -> question.question_id
- answer_session.form_id -> form.form_id
- answer_session.patient_id -> patient.patient_id
- answer_session.visit_id -> visit.visit_id
- answer_session.submitted_by -> user_account.user_id
- form_section.form_id -> form.form_id
- form_question.section_id -> form_section.section_id
- form_question_option.question_id -> form_question.question_id
- form_answer.session_id -> answer_session.session_id
- form_answer.question_id -> form_question.question_id
- form_answer.option_id -> form_question_option.option_id

## 5) Execution flows for implementation

### Flow A: account and role
1. Create role first.
2. Create user_account with valid role_id.
3. Optionally create doctor/patient profile linked by user_id.

### Flow B: appointment to visit
1. Master data: clinic -> room, doctor, patient.
2. Create appointment.
3. On actual examination, create visit.

### Flow C: visit to prescription and invoice
1. Create prescription for visit.
2. Add prescription_detail rows (medication items).
3. Create invoice for visit.
4. Add invoice_detail rows (service items).
5. Record payment with method/status.

### Flow D: form submission
Legacy path:
1. Build form -> section -> question (+ option_choice).
2. Start answer_session.
3. Save answers in answer + answer_value.

V2 path:
1. Build form -> form_section -> form_question (+ form_question_option).
2. Start answer_session.
3. Save answers in form_answer.

## 6) Critical rules for AI agents (must follow)
1. Do not assume static .sql files are current.
2. Validate entity mapping against LIVE FK/PK before coding migrations.
3. Keep role_id FK model in user_account (no legacy user_account.role reintroduction).
4. For form features, decide branch explicitly (legacy vs v2) before writing service/repository code.
5. Avoid mixing answer/answer_value with form_answer in the same write path unless a migration plan says so.

## 7) Current data signal (from live stats)
- Database is almost empty (only very small seed data observed).
- Do not infer business behavior from current row counts.
- Infer behavior from constraints and table relations instead.

## 8) Quick SQL to refresh this guide later
Use these queries on PostgreSQL to regenerate the same view:
- table list in public
- PK map from information_schema.table_constraints + key_column_usage
- FK map from information_schema.table_constraints + referential_constraints + key_column_usage
- columns map from information_schema.columns

If schema changes, update this file immediately so AI-generated code stays aligned.
