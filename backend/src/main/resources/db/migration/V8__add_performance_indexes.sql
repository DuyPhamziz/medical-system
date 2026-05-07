-- V8: Add performance indexes for frequently-queried columns

-- form_answer: filtered by session_id on every save/submit
CREATE INDEX IF NOT EXISTS idx_form_answer_session_id ON form_answer(session_id);

-- form_answer: filtered by question_id in joins and processing
CREATE INDEX IF NOT EXISTS idx_form_answer_question_id ON form_answer(question_id);

-- visit: filtered by patient_id in patient history queries
CREATE INDEX IF NOT EXISTS idx_visit_patient_id ON visit(patient_id);

-- visit: filtered by doctor_id for doctor dashboard
CREATE INDEX IF NOT EXISTS idx_visit_doctor_id ON visit(doctor_id);

-- form_question: filtered by section_id during form loading
CREATE INDEX IF NOT EXISTS idx_form_question_section_id ON form_question(section_id);

-- form_section: filtered by form_id during form loading
CREATE INDEX IF NOT EXISTS idx_form_section_form_id ON form_section(form_id);

-- form_question_option: filtered by question_id during form loading
CREATE INDEX IF NOT EXISTS idx_form_question_option_question_id ON form_question_option(question_id);

-- answer_session: filtered by patient_id for history queries
CREATE INDEX IF NOT EXISTS idx_answer_session_patient_id ON answer_session(patient_id);

-- answer_session: filtered by form_id for form-specific queries
CREATE INDEX IF NOT EXISTS idx_answer_session_form_id ON answer_session(form_id);
