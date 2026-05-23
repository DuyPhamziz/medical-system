-- V15: Add missing performance indexes on critical join columns
-- These columns are frequently used in JOINs and WHERE clauses but were not indexed

-- Prescription lookups by visit
CREATE INDEX IF NOT EXISTS idx_prescription_visit_id ON prescription(visit_id);

-- Invoice lookups by visit
CREATE INDEX IF NOT EXISTS idx_invoice_visit_id ON invoice(visit_id);

-- Invoice detail lookups by invoice
CREATE INDEX IF NOT EXISTS idx_invoice_detail_invoice_id ON invoice_detail(invoice_id);

-- Payment history for a user
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment(user_id);

-- Patient appointment history
CREATE INDEX IF NOT EXISTS idx_appointment_patient_id ON appointment(patient_id);

-- Room schedule queries
CREATE INDEX IF NOT EXISTS idx_appointment_room_id ON appointment(room_id);

-- Answer session lookups by visit
CREATE INDEX IF NOT EXISTS idx_answer_session_visit_id ON answer_session(visit_id);
