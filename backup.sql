--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer (
    answer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    repeat_index integer,
    question_id uuid,
    session_id uuid,
    value_id uuid
);


ALTER TABLE public.answer OWNER TO postgres;

--
-- Name: answer_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer_session (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    start_time timestamp without time zone,
    submit_time timestamp without time zone,
    status character varying(20),
    patient_id uuid,
    form_id uuid,
    visit_id uuid,
    last_saved_at timestamp(6) without time zone NOT NULL,
    source character varying(20) NOT NULL,
    started_at timestamp(6) without time zone NOT NULL,
    submitted_at timestamp(6) without time zone,
    total_score numeric(12,2) NOT NULL,
    submitted_by uuid,
    CONSTRAINT answer_session_source_check CHECK (((source)::text = ANY ((ARRAY['PATIENT'::character varying, 'DOCTOR'::character varying])::text[])))
);


ALTER TABLE public.answer_session OWNER TO postgres;

--
-- Name: answer_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer_value (
    value_id uuid DEFAULT gen_random_uuid() NOT NULL,
    text_value text,
    number_value numeric,
    date_value timestamp without time zone,
    file_url text,
    option_id uuid
);


ALTER TABLE public.answer_value OWNER TO postgres;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    appointment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    reason text,
    status character varying(50),
    doctor_id uuid,
    patient_id uuid,
    room_id uuid
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    action character varying(255) NOT NULL,
    details text,
    ip_address character varying(255),
    resource_id character varying(255),
    resource_type character varying(255),
    "timestamp" timestamp(6) without time zone NOT NULL,
    user_id uuid
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: clinic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic (
    clinic_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    address text,
    phone character varying(20)
);


ALTER TABLE public.clinic OWNER TO postgres;

--
-- Name: clinical_scale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinical_scale (
    scale_id uuid NOT NULL,
    category character varying(50) NOT NULL,
    config_json jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    interpretation_json jsonb,
    is_active boolean NOT NULL,
    max_score integer NOT NULL,
    min_score integer NOT NULL,
    name character varying(100) NOT NULL,
    scoring_format character varying(50),
    total_questions integer NOT NULL,
    version bigint
);


ALTER TABLE public.clinical_scale OWNER TO postgres;

--
-- Name: doctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor (
    doctor_id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255),
    user_id uuid
);


ALTER TABLE public.doctor OWNER TO postgres;

--
-- Name: family_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_member (
    family_member_id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid,
    full_name character varying(255) NOT NULL,
    gender character varying(20),
    year_of_birth integer,
    is_patient boolean DEFAULT false
);


ALTER TABLE public.family_member OWNER TO postgres;

--
-- Name: family_member_disease; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_member_disease (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_member_id uuid,
    disease_name character varying(255),
    diagnosed_year integer,
    note text
);


ALTER TABLE public.family_member_disease OWNER TO postgres;

--
-- Name: family_relationship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_relationship (
    relationship_id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_id uuid,
    related_person_id uuid,
    relationship_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.family_relationship OWNER TO postgres;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form (
    form_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255),
    description text,
    is_template boolean,
    is_active boolean,
    is_paid boolean,
    price numeric(12,2),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    user_id uuid,
    is_public boolean NOT NULL,
    published_at timestamp(6) without time zone,
    status character varying(20) NOT NULL,
    version integer NOT NULL,
    created_by uuid NOT NULL,
    visibility character varying(20),
    CONSTRAINT form_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[]))),
    CONSTRAINT form_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['PUBLIC'::character varying, 'DOCTOR_ONLY'::character varying, 'PRIVATE'::character varying])::text[])))
);


ALTER TABLE public.form OWNER TO postgres;

--
-- Name: form_answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_answer (
    answer_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    repeat_index integer NOT NULL,
    value_boolean boolean,
    value_date date,
    value_json jsonb,
    value_number numeric(12,2),
    value_text text,
    option_id uuid,
    question_id uuid NOT NULL,
    session_id uuid NOT NULL,
    value_datetime timestamp(6) without time zone
);


ALTER TABLE public.form_answer OWNER TO postgres;

--
-- Name: form_question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_question (
    question_id uuid NOT NULL,
    allow_repeat boolean NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    helper_text text,
    max_length integer,
    max_value numeric(12,2),
    min_length integer,
    min_value numeric(12,2),
    order_index integer NOT NULL,
    placeholder text,
    question_type character varying(30) NOT NULL,
    is_required boolean NOT NULL,
    scale_max integer,
    scale_min integer,
    updated_at timestamp(6) without time zone NOT NULL,
    validation_message character varying(255),
    validation_pattern character varying(255),
    section_id uuid NOT NULL,
    config_json jsonb,
    trigger_logic text,
    CONSTRAINT form_question_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['TEXT'::character varying, 'NUMBER'::character varying, 'DATE'::character varying, 'SINGLE_CHOICE'::character varying, 'MULTIPLE_CHOICE'::character varying, 'SCALE'::character varying, 'FILE_UPLOAD'::character varying, 'MATRIX'::character varying, 'CALCULATED'::character varying, 'LOOKUP'::character varying, 'PEDIGREE'::character varying, 'DATETIME'::character varying, 'TIME_SERIES'::character varying, 'BODY_MAP'::character varying])::text[])))
);


ALTER TABLE public.form_question OWNER TO postgres;

--
-- Name: form_question_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_question_option (
    option_id uuid NOT NULL,
    content text NOT NULL,
    order_index integer NOT NULL,
    score numeric(12,2) NOT NULL,
    trigger_logic jsonb,
    question_id uuid NOT NULL
);


ALTER TABLE public.form_question_option OWNER TO postgres;

--
-- Name: form_section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_section (
    section_id uuid NOT NULL,
    allow_repeat boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    order_index integer NOT NULL,
    repeat_label character varying(120),
    title character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    form_id uuid NOT NULL
);


ALTER TABLE public.form_section OWNER TO postgres;

--
-- Name: form_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_type (
    form_type_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255)
);


ALTER TABLE public.form_type OWNER TO postgres;

--
-- Name: invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice (
    invoice_id uuid DEFAULT gen_random_uuid() NOT NULL,
    total_amount numeric,
    status character varying(50),
    created_at timestamp without time zone,
    visit_id uuid
);


ALTER TABLE public.invoice OWNER TO postgres;

--
-- Name: invoice_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_detail (
    detail_id uuid DEFAULT gen_random_uuid() NOT NULL,
    quantity integer,
    unit_price numeric,
    service_id uuid,
    invoice_id uuid
);


ALTER TABLE public.invoice_detail OWNER TO postgres;

--
-- Name: medication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medication (
    medication_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    unit character varying(50)
);


ALTER TABLE public.medication OWNER TO postgres;

--
-- Name: option_choice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.option_choice (
    option_id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text,
    score numeric,
    order_index integer,
    trigger_repeat boolean,
    question_id uuid
);


ALTER TABLE public.option_choice OWNER TO postgres;

--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    org_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    type character varying(50),
    email character varying(100),
    phone character varying(20),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: organization_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_member (
    member_id uuid DEFAULT gen_random_uuid() NOT NULL,
    role character varying(50),
    status character varying(50),
    org_id uuid,
    user_id uuid
);


ALTER TABLE public.organization_member OWNER TO postgres;

--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    patient_id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255),
    date_of_birth date,
    gender character varying(20),
    biological_gender character varying(20),
    psychological_gender character varying(20),
    phone character varying(20),
    address character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid,
    phone_number character varying(20),
    national_id character varying(50),
    health_insurance_number character varying(50),
    occupation character varying(255),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    status character varying(20) DEFAULT 'ACTIVE'::character varying
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    payment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount numeric,
    description text,
    expiry_date timestamp without time zone,
    plan_type character varying(50),
    user_id uuid,
    status_id uuid,
    method_id uuid
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- Name: payment_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_method (
    method_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100)
);


ALTER TABLE public.payment_method OWNER TO postgres;

--
-- Name: payment_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_status (
    status_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100)
);


ALTER TABLE public.payment_status OWNER TO postgres;

--
-- Name: prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription (
    prescription_id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone,
    note text,
    visit_id uuid
);


ALTER TABLE public.prescription OWNER TO postgres;

--
-- Name: prescription_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_detail (
    medication_id uuid NOT NULL,
    prescription_id uuid NOT NULL,
    dosage character varying(100),
    frequency character varying(100),
    duration character varying(100)
);


ALTER TABLE public.prescription_detail OWNER TO postgres;

--
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question (
    question_id uuid DEFAULT gen_random_uuid() NOT NULL,
    content text,
    is_required boolean,
    order_index integer,
    allow_skip boolean,
    allow_repeat boolean,
    max_repeat integer,
    score numeric,
    hint text,
    min_value numeric,
    max_value numeric,
    min_length integer,
    max_length integer,
    placeholder text,
    question_type_id uuid
);


ALTER TABLE public.question OWNER TO postgres;

--
-- Name: question_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_type (
    question_type_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255)
);


ALTER TABLE public.question_type OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    role_id character varying(64) NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room (
    room_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    type character varying(50),
    clinic_id uuid
);


ALTER TABLE public.room OWNER TO postgres;

--
-- Name: section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section (
    section_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255),
    description text,
    order_index integer,
    form_id uuid
);


ALTER TABLE public.section OWNER TO postgres;

--
-- Name: section_question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_question (
    question_id uuid NOT NULL,
    section_id uuid NOT NULL,
    order_index integer
);


ALTER TABLE public.section_question OWNER TO postgres;

--
-- Name: service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service (
    service_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    description text,
    price numeric,
    type character varying(50)
);


ALTER TABLE public.service OWNER TO postgres;

--
-- Name: user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_account (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role_id character varying(64) NOT NULL,
    full_name character varying(255)
);


ALTER TABLE public.user_account OWNER TO postgres;

--
-- Name: visit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit (
    visit_id uuid DEFAULT gen_random_uuid() NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    reason text,
    preliminary_diagnosis text,
    note text,
    doctor_id uuid,
    room_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    diagnosis character varying(2000),
    notes text,
    reason_for_visit character varying(1000),
    status character varying(20) NOT NULL,
    treatment_plan character varying(2000),
    visit_date timestamp(6) without time zone NOT NULL,
    patient_id uuid NOT NULL,
    CONSTRAINT visit_status_check CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.visit OWNER TO postgres;

--
-- Name: vital_signs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vital_signs (
    vital_sign_id uuid NOT NULL,
    blood_pressure_diastolic integer,
    blood_pressure_systolic integer,
    bmi double precision,
    heart_rate integer,
    height double precision,
    oxygen_saturation integer,
    recorded_at timestamp(6) without time zone NOT NULL,
    respiratory_rate integer,
    temperature double precision,
    weight double precision,
    patient_id uuid NOT NULL,
    visit_id uuid
);


ALTER TABLE public.vital_signs OWNER TO postgres;

--
-- Data for Name: answer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.answer (answer_id, repeat_index, question_id, session_id, value_id) FROM stdin;
\.


--
-- Data for Name: answer_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.answer_session (session_id, start_time, submit_time, status, patient_id, form_id, visit_id, last_saved_at, source, started_at, submitted_at, total_score, submitted_by) FROM stdin;
\.


--
-- Data for Name: answer_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.answer_value (value_id, text_value, number_value, date_value, file_url, option_id) FROM stdin;
\.


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (appointment_id, start_time, end_time, reason, status, doctor_id, patient_id, room_id) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action, details, ip_address, resource_id, resource_type, "timestamp", user_id) FROM stdin;
\.


--
-- Data for Name: clinic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic (clinic_id, name, address, phone) FROM stdin;
\.


--
-- Data for Name: clinical_scale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinical_scale (scale_id, category, config_json, created_at, description, interpretation_json, is_active, max_score, min_score, name, scoring_format, total_questions, version) FROM stdin;
\.


--
-- Data for Name: doctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctor (doctor_id, full_name, user_id) FROM stdin;
\.


--
-- Data for Name: family_member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_member (family_member_id, patient_id, full_name, gender, year_of_birth, is_patient) FROM stdin;
\.


--
-- Data for Name: family_member_disease; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_member_disease (id, family_member_id, disease_name, diagnosed_year, note) FROM stdin;
\.


--
-- Data for Name: family_relationship; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_relationship (relationship_id, person_id, related_person_id, relationship_type, created_at) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	<< Flyway Baseline >>	BASELINE	<< Flyway Baseline >>	\N	postgres	2026-04-28 19:49:18.663498	0	t
2	2	migration drop legacy role col	SQL	V2__migration_drop_legacy_role_col.sql	1233881866	postgres	2026-04-28 19:53:06.472714	169	t
3	3	migration hash role ids	SQL	V3__migration_hash_role_ids.sql	-660458812	postgres	2026-04-28 19:53:06.819789	48	t
4	4	add trigger logic to question	SQL	V4__add_trigger_logic_to_question.sql	887359427	postgres	2026-04-28 23:49:31.439543	19	t
5	5	fix patient schema	SQL	V5__fix_patient_schema.sql	-905324180	postgres	2026-04-29 14:04:01.651018	64	t
6	6	update question type constraint	SQL	V6__update_question_type_constraint.sql	421780733	postgres	2026-04-29 15:36:55.589849	71	t
\.


--
-- Data for Name: form; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form (form_id, title, description, is_template, is_active, is_paid, price, created_at, updated_at, user_id, is_public, published_at, status, version, created_by, visibility) FROM stdin;
99681f2a-c437-4322-a037-352544b3f934	aaaaaaaaaaaaaaa	a	f	\N	f	0.00	2026-04-25 13:25:21.940451	2026-04-25 13:25:21.940451	\N	t	\N	DRAFT	1	209fdbbf-04bc-4691-b421-ff0ee7477790	PUBLIC
99d4c8f1-c65c-437c-9793-d1df9ff95771	KHÁM SỨC KHỎE TỔNG QUÁT	Nhập một lần biết hết tất cả thông tin.	f	\N	f	0.00	2026-04-24 19:12:44.595715	2026-04-29 19:25:04.505912	\N	t	2026-04-29 19:25:04.498853	PUBLISHED	45	209fdbbf-04bc-4691-b421-ff0ee7477790	PUBLIC
\.


--
-- Data for Name: form_answer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_answer (answer_id, created_at, repeat_index, value_boolean, value_date, value_json, value_number, value_text, option_id, question_id, session_id, value_datetime) FROM stdin;
\.


--
-- Data for Name: form_question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_question (question_id, allow_repeat, content, created_at, helper_text, max_length, max_value, min_length, min_value, order_index, placeholder, question_type, is_required, scale_max, scale_min, updated_at, validation_message, validation_pattern, section_id, config_json, trigger_logic) FROM stdin;
e3e617df-13fe-4046-9449-7051dab42724	f	Họ và tên 	2026-04-29 00:29:39.164415	\N	\N	\N	\N	\N	0	\N	TEXT	t	\N	\N	2026-04-29 00:29:39.164415	\N	\N	bbca3555-1f1c-4a9c-801f-c28b6962f7ca	\N	\N
63bd074b-8450-49a0-9479-3dede6e348f9	f	Số điện thoại	2026-04-29 00:29:39.165031	\N	\N	5.00	\N	1.00	1	\N	NUMBER	f	\N	\N	2026-04-29 00:29:39.165031	\N	\N	bbca3555-1f1c-4a9c-801f-c28b6962f7ca	\N	\N
8a2606bd-3b6c-4066-840a-a92596cee4cb	f	Quê quán	2026-04-29 00:29:39.165031	\N	\N	\N	\N	\N	2	\N	TEXT	f	\N	\N	2026-04-29 00:29:39.165031	\N	\N	bbca3555-1f1c-4a9c-801f-c28b6962f7ca	\N	\N
a1dbb765-9667-41e8-9665-d385e5a96089	f	Họ và tên	2026-04-25 13:25:21.953137	\N	\N	\N	\N	\N	0	ahihi	TEXT	t	\N	\N	2026-04-25 13:25:21.953137	\N	\N	b80ce5d4-26ad-4813-ab24-d251bab26b47	\N	\N
cceab3e0-8da9-4823-8d24-3f21ef785ffa	f	Giới tính tâm lý	2026-04-29 16:50:50.26397	\N	\N	\N	\N	\N	4	\N	SINGLE_CHOICE	f	\N	\N	2026-04-29 16:50:50.26397	\N	\N	bbca3555-1f1c-4a9c-801f-c28b6962f7ca	\N	\N
f5abcb48-2332-4978-acd7-2173e3547dca	f	Giới tính sinh học	2026-04-29 00:29:39.165031	\N	\N	\N	\N	\N	3	Giới tính sinh học của bạn từ khi sinh ra?	SINGLE_CHOICE	f	\N	\N	2026-04-29 16:50:50.269003	\N	\N	bbca3555-1f1c-4a9c-801f-c28b6962f7ca	\N	\N
878e87a2-e729-44d8-86f1-f4ded24b122a	f	Bạn đã từng phẫu thuật liên quan đến cơ quan sinh sản hoặc sinh dục chưa?”\n(Ví dụ: tử cung, buồng trứng, tinh hoàn, tuyến tiền liệt)	2026-04-29 18:12:14.738351	\N	\N	\N	\N	\N	0	\N	SINGLE_CHOICE	f	\N	\N	2026-04-29 18:12:14.738351	\N	\N	b5633027-84b0-4574-b731-74341d5ca04c	\N	\N
59662af7-9a54-46fa-bbe3-538025084f1c	f	Đang sử dụng hormon: testoterol, estrogen	2026-04-29 19:17:12.03332	\N	\N	\N	\N	\N	1	\N	TEXT	f	\N	\N	2026-04-29 19:17:12.03332	\N	\N	b5633027-84b0-4574-b731-74341d5ca04c	\N	\N
9d248d02-b18c-4d27-b6ca-1d5951b6fd74	f	Bạn có các lưu ý gì khác cho bác sĩ về phần này không?	2026-04-29 19:17:12.03432	\N	\N	\N	\N	\N	2	\N	TEXT	f	\N	\N	2026-04-29 19:17:12.03432	\N	\N	b5633027-84b0-4574-b731-74341d5ca04c	\N	\N
592b3835-2521-4ffd-a53c-c6cf567e4c3e	f	Tính chất nghề nghiệp	2026-04-29 19:22:46.047931	\N	\N	\N	\N	\N	0	\N	MATRIX	f	\N	\N	2026-04-29 19:25:04.416104	\N	\N	139e0570-d470-4667-9cab-00ed39ebb6b7	{"matrixRows": [{"label": "Nghề nghiệp", "rowId": "11775eb5-2d13-47ee-a53a-7f0783162edf"}]}	\N
\.


--
-- Data for Name: form_question_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_question_option (option_id, content, order_index, score, trigger_logic, question_id) FROM stdin;
0a13cd9b-5359-4025-96b5-39b52de0d820	Nam	0	0.00	\N	f5abcb48-2332-4978-acd7-2173e3547dca
6201ca6f-07fe-4ee8-b843-2eb6f2977d09	Nữ	1	0.00	\N	f5abcb48-2332-4978-acd7-2173e3547dca
205e22e7-3999-4c4a-8532-0b546966d349	Nam	0	0.00	\N	cceab3e0-8da9-4823-8d24-3f21ef785ffa
586b486b-e23b-4392-9d2e-63e614ebe7b5	Nữ	1	0.00	\N	cceab3e0-8da9-4823-8d24-3f21ef785ffa
f981d7e0-364b-4332-b1b0-d918bdf42278	Khác	2	0.00	\N	cceab3e0-8da9-4823-8d24-3f21ef785ffa
b2d5d1a5-5e05-44ca-894d-89e36cd0c5fc	Có	0	0.00	\N	878e87a2-e729-44d8-86f1-f4ded24b122a
20cd937f-03c7-48cf-a06d-e68f8aa1431e	Không	1	0.00	\N	878e87a2-e729-44d8-86f1-f4ded24b122a
11775eb5-2d13-47ee-a53a-7f0783162edf	Nghề nghiệp	0	0.00	{"type": "row"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
2187ea63-fab7-4c6f-ad33-a7bfaaf2b669	Áp lực tâm lý/tinh thần	1	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
930f61f9-d02c-45fe-a78b-857e42dbadf6	Gắng sức thể chất	2	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
be00e2c1-5168-49a1-866a-3625837a64fd	Làm việc ban đêm, xoay ca không cố định	3	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
c81a8c61-dc19-4dfa-96a3-700532190183	Làm việc trong môi trường ồn	4	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
e29e4fd0-574a-4dee-9ef6-58ca73ab3a52	Tiếp xúc bụi	5	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
43d7743d-2c4f-43ef-8b6b-53ed35baa6a2	Tiếp xúc hóa chất	6	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
1c14c8d0-e2b5-4e26-84e2-7a985461feb7	Tiếp xúc bức xạ / tia sáng mạnh	7	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
80e966e9-5df5-4af0-961d-8f94d1d42f57	Nhiệt độ khắc nghiệt	8	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
516af36a-626c-453a-acd4-df856177dd81	Tiếp xúc vi sinh vật / dịch cơ thể	9	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
3fd4bd3a-2a4d-4fe4-8019-1649403394e9	Làm việc ngoài trời	10	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
02c8cf6f-e506-4726-9535-febed1df3f8a	Rung, rung lắc từ thiết bị	11	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
afaf5deb-660a-4022-b2f0-c9b5fcb4a23a	Ánh sáng kém hoặc quá mạnh	12	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
b73448c9-b3a9-4edd-bcf8-7c5a09f875c0	Không được đào tạo đầy đủ về an toàn	13	0.00	{"type": "column"}	592b3835-2521-4ffd-a53c-c6cf567e4c3e
\.


--
-- Data for Name: form_section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_section (section_id, allow_repeat, created_at, description, order_index, repeat_label, title, updated_at, form_id) FROM stdin;
139e0570-d470-4667-9cab-00ed39ebb6b7	f	2026-04-29 19:18:12.552184		2	\N	Nghề nghiệp	2026-04-29 19:18:12.552184	99d4c8f1-c65c-437c-9793-d1df9ff95771
b80ce5d4-26ad-4813-ab24-d251bab26b47	f	2026-04-25 13:25:21.951488	aaa	0	\N	Thông tin chung	2026-04-25 13:25:21.951488	99681f2a-c437-4322-a037-352544b3f934
bbca3555-1f1c-4a9c-801f-c28b6962f7ca	f	2026-04-29 00:29:39.164415		0	\N	Thông tin chung	2026-04-29 00:29:39.164415	99d4c8f1-c65c-437c-9793-d1df9ff95771
b5633027-84b0-4574-b731-74341d5ca04c	f	2026-04-29 18:12:14.727109		1	\N	Can thiệp giới tính	2026-04-29 18:12:14.727109	99d4c8f1-c65c-437c-9793-d1df9ff95771
\.


--
-- Data for Name: form_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_type (form_type_id, name) FROM stdin;
\.


--
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice (invoice_id, total_amount, status, created_at, visit_id) FROM stdin;
\.


--
-- Data for Name: invoice_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_detail (detail_id, quantity, unit_price, service_id, invoice_id) FROM stdin;
\.


--
-- Data for Name: medication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medication (medication_id, name, unit) FROM stdin;
\.


--
-- Data for Name: option_choice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.option_choice (option_id, content, score, order_index, trigger_repeat, question_id) FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (org_id, name, type, email, phone, address, created_at) FROM stdin;
\.


--
-- Data for Name: organization_member; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_member (member_id, role, status, org_id, user_id) FROM stdin;
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (patient_id, full_name, date_of_birth, gender, biological_gender, psychological_gender, phone, address, created_at, user_id, phone_number, national_id, health_insurance_number, occupation, emergency_contact_name, emergency_contact_phone, status) FROM stdin;
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (payment_id, amount, description, expiry_date, plan_type, user_id, status_id, method_id) FROM stdin;
\.


--
-- Data for Name: payment_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_method (method_id, name) FROM stdin;
\.


--
-- Data for Name: payment_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_status (status_id, name) FROM stdin;
\.


--
-- Data for Name: prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription (prescription_id, created_at, note, visit_id) FROM stdin;
\.


--
-- Data for Name: prescription_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_detail (medication_id, prescription_id, dosage, frequency, duration) FROM stdin;
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question (question_id, content, is_required, order_index, allow_skip, allow_repeat, max_repeat, score, hint, min_value, max_value, min_length, max_length, placeholder, question_type_id) FROM stdin;
\.


--
-- Data for Name: question_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_type (question_type_id, name) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role_name) FROM stdin;
835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be	ADMIN
0d8b1eaf613adfeff42e6fc12f168c188a8256fd509ef79c3e214fb0a4687109	DOCTOR
0a935ec18ca52f08785c9c17d0160d1d62115348cc808392033fcef3e93c6d5c	PATIENT
edeea48516c33a2436c2221f3078e54797d58710dcb3efd0417039d934d53b58	STAFF
\.


--
-- Data for Name: room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room (room_id, name, type, clinic_id) FROM stdin;
\.


--
-- Data for Name: section; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section (section_id, title, description, order_index, form_id) FROM stdin;
\.


--
-- Data for Name: section_question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_question (question_id, section_id, order_index) FROM stdin;
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service (service_id, name, description, price, type) FROM stdin;
\.


--
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_account (user_id, username, email, password, created_at, role_id, full_name) FROM stdin;
c07480cd-f022-4cea-9b11-15d7e935387d	System Admin	admin@hospital.local	$2a$10$I7pslW3cizeisJtAMf9WZ.Pl4k3l4fp8YhGExOVKx.truUV61/gra	2026-04-23 22:44:42.710954	835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be	\N
209fdbbf-04bc-4691-b421-ff0ee7477790	Dr. Demo	doctor@hospital.local	$2a$10$xrZS/9h1dF3hFbUX40uWzuA35V3sex8Ba8en3iX7xRvWiesV6Htcy	2026-04-23 22:44:42.851956	0d8b1eaf613adfeff42e6fc12f168c188a8256fd509ef79c3e214fb0a4687109	\N
1571f9b4-bc1d-4374-a22d-86b3f0815638	Patient Demo	patient@hospital.local	$2a$10$42vPsQn8akDGsEnXWZjhY..pXfNwwpfr6OmZu/2vEht8a0cOAqyPG	2026-04-23 22:44:42.95096	0a935ec18ca52f08785c9c17d0160d1d62115348cc808392033fcef3e93c6d5c	\N
\.


--
-- Data for Name: visit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit (visit_id, start_time, end_time, reason, preliminary_diagnosis, note, doctor_id, room_id, created_at, diagnosis, notes, reason_for_visit, status, treatment_plan, visit_date, patient_id) FROM stdin;
\.


--
-- Data for Name: vital_signs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vital_signs (vital_sign_id, blood_pressure_diastolic, blood_pressure_systolic, bmi, heart_rate, height, oxygen_saturation, recorded_at, respiratory_rate, temperature, weight, patient_id, visit_id) FROM stdin;
\.


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (answer_id);


--
-- Name: answer_session answer_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_session
    ADD CONSTRAINT answer_session_pkey PRIMARY KEY (session_id);


--
-- Name: answer_value answer_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_value
    ADD CONSTRAINT answer_value_pkey PRIMARY KEY (value_id);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (appointment_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: clinic clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT clinic_pkey PRIMARY KEY (clinic_id);


--
-- Name: clinical_scale clinical_scale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_scale
    ADD CONSTRAINT clinical_scale_pkey PRIMARY KEY (scale_id);


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (doctor_id);


--
-- Name: family_member_disease family_member_disease_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_member_disease
    ADD CONSTRAINT family_member_disease_pkey PRIMARY KEY (id);


--
-- Name: family_member family_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_member
    ADD CONSTRAINT family_member_pkey PRIMARY KEY (family_member_id);


--
-- Name: family_relationship family_relationship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_relationship
    ADD CONSTRAINT family_relationship_pkey PRIMARY KEY (relationship_id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: form_answer form_answer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_answer
    ADD CONSTRAINT form_answer_pkey PRIMARY KEY (answer_id);


--
-- Name: form form_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT form_pkey PRIMARY KEY (form_id);


--
-- Name: form_question_option form_question_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_question_option
    ADD CONSTRAINT form_question_option_pkey PRIMARY KEY (option_id);


--
-- Name: form_question form_question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_question
    ADD CONSTRAINT form_question_pkey PRIMARY KEY (question_id);


--
-- Name: form_section form_section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_section
    ADD CONSTRAINT form_section_pkey PRIMARY KEY (section_id);


--
-- Name: form_type form_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_type
    ADD CONSTRAINT form_type_pkey PRIMARY KEY (form_type_id);


--
-- Name: invoice_detail invoice_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_detail
    ADD CONSTRAINT invoice_detail_pkey PRIMARY KEY (detail_id);


--
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (invoice_id);


--
-- Name: medication medication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication
    ADD CONSTRAINT medication_pkey PRIMARY KEY (medication_id);


--
-- Name: option_choice option_choice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_choice
    ADD CONSTRAINT option_choice_pkey PRIMARY KEY (option_id);


--
-- Name: organization_member organization_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_member
    ADD CONSTRAINT organization_member_pkey PRIMARY KEY (member_id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (org_id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (patient_id);


--
-- Name: payment_method payment_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT payment_method_pkey PRIMARY KEY (method_id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);


--
-- Name: payment_status payment_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_status
    ADD CONSTRAINT payment_status_pkey PRIMARY KEY (status_id);


--
-- Name: prescription_detail prescription_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_detail
    ADD CONSTRAINT prescription_detail_pkey PRIMARY KEY (medication_id, prescription_id);


--
-- Name: prescription prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_pkey PRIMARY KEY (prescription_id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (question_id);


--
-- Name: question_type question_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_type
    ADD CONSTRAINT question_type_pkey PRIMARY KEY (question_type_id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- Name: room room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT room_pkey PRIMARY KEY (room_id);


--
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (section_id);


--
-- Name: section_question section_question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_question
    ADD CONSTRAINT section_question_pkey PRIMARY KEY (question_id, section_id);


--
-- Name: service service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_pkey PRIMARY KEY (service_id);


--
-- Name: clinical_scale uknlcegvfwl0xqmwfm149v1r0vh; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinical_scale
    ADD CONSTRAINT uknlcegvfwl0xqmwfm149v1r0vh UNIQUE (name);


--
-- Name: user_account user_account_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_email_key UNIQUE (email);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (user_id);


--
-- Name: user_account user_account_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_username_key UNIQUE (username);


--
-- Name: visit visit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_pkey PRIMARY KEY (visit_id);


--
-- Name: vital_signs vital_signs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vital_signs
    ADD CONSTRAINT vital_signs_pkey PRIMARY KEY (vital_sign_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_answer_session_form_patient_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answer_session_form_patient_time ON public.answer_session USING btree (form_id, patient_id, start_time);


--
-- Name: idx_appointment_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_doctor_id ON public.appointment USING btree (doctor_id);


--
-- Name: idx_appointment_doctor_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_doctor_time ON public.appointment USING btree (doctor_id, start_time);


--
-- Name: idx_appointment_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_patient_id ON public.appointment USING btree (patient_id);


--
-- Name: idx_doctor_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_user_id ON public.doctor USING btree (user_id);


--
-- Name: idx_org_member_org_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_member_org_id ON public.organization_member USING btree (org_id);


--
-- Name: idx_org_member_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_org_member_user_id ON public.organization_member USING btree (user_id);


--
-- Name: idx_patient_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_user_id ON public.patient USING btree (user_id);


--
-- Name: idx_room_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_clinic_id ON public.room USING btree (clinic_id);


--
-- Name: idx_user_account_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_account_email ON public.user_account USING btree (email);


--
-- Name: idx_user_account_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_account_role_id ON public.user_account USING btree (role_id);


--
-- Name: idx_user_account_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_account_username ON public.user_account USING btree (username);


--
-- Name: idx_visit_doctor_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_visit_doctor_time ON public.visit USING btree (doctor_id, start_time);


--
-- Name: answer answer_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: answer_session answer_session_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_session
    ADD CONSTRAINT answer_session_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.form(form_id);


--
-- Name: answer answer_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.answer_session(session_id);


--
-- Name: answer_session answer_session_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_session
    ADD CONSTRAINT answer_session_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: answer_session answer_session_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_session
    ADD CONSTRAINT answer_session_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: appointment appointment_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor(doctor_id);


--
-- Name: appointment appointment_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: appointment appointment_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.room(room_id);


--
-- Name: doctor doctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(user_id);


--
-- Name: family_member_disease family_member_disease_family_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_member_disease
    ADD CONSTRAINT family_member_disease_family_member_id_fkey FOREIGN KEY (family_member_id) REFERENCES public.family_member(family_member_id);


--
-- Name: family_member family_member_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_member
    ADD CONSTRAINT family_member_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: family_relationship family_relationship_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_relationship
    ADD CONSTRAINT family_relationship_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.family_member(family_member_id);


--
-- Name: family_relationship family_relationship_related_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_relationship
    ADD CONSTRAINT family_relationship_related_person_id_fkey FOREIGN KEY (related_person_id) REFERENCES public.family_member(family_member_id);


--
-- Name: vital_signs fk3bfrsnjy5feemik1kteb59k9r; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vital_signs
    ADD CONSTRAINT fk3bfrsnjy5feemik1kteb59k9r FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: visit fkesmtbikahcckkgowj5f28k37s; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT fkesmtbikahcckkgowj5f28k37s FOREIGN KEY (doctor_id) REFERENCES public.user_account(user_id);


--
-- Name: form_answer fkh8yxfyqe2oiabl2uy44ojncuv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_answer
    ADD CONSTRAINT fkh8yxfyqe2oiabl2uy44ojncuv FOREIGN KEY (question_id) REFERENCES public.form_question(question_id);


--
-- Name: form_answer fkiu6hj1ejqpfff4tpb8q5fgrnk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_answer
    ADD CONSTRAINT fkiu6hj1ejqpfff4tpb8q5fgrnk FOREIGN KEY (session_id) REFERENCES public.answer_session(session_id);


--
-- Name: form_question fkkuutdo9giul82oeuj88wk81ga; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_question
    ADD CONSTRAINT fkkuutdo9giul82oeuj88wk81ga FOREIGN KEY (section_id) REFERENCES public.form_section(section_id);


--
-- Name: form_answer fkmbed23pxvpkw95eqwjgud8ei7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_answer
    ADD CONSTRAINT fkmbed23pxvpkw95eqwjgud8ei7 FOREIGN KEY (option_id) REFERENCES public.form_question_option(option_id);


--
-- Name: form_question_option fkn64kewdvgs9qibopnii9nh7sx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_question_option
    ADD CONSTRAINT fkn64kewdvgs9qibopnii9nh7sx FOREIGN KEY (question_id) REFERENCES public.form_question(question_id);


--
-- Name: form_section fkpvynqwi2t1wrw3wv1imaidi8s; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_section
    ADD CONSTRAINT fkpvynqwi2t1wrw3wv1imaidi8s FOREIGN KEY (form_id) REFERENCES public.form(form_id);


--
-- Name: answer_session fkq5uux9icxmo1tos8xq3a618a7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer_session
    ADD CONSTRAINT fkq5uux9icxmo1tos8xq3a618a7 FOREIGN KEY (submitted_by) REFERENCES public.user_account(user_id);


--
-- Name: visit fkrban5yeabnx30seqm69jw44e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT fkrban5yeabnx30seqm69jw44e FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: form fkrgckc1psqvy1of199dsj3n5su; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT fkrgckc1psqvy1of199dsj3n5su FOREIGN KEY (created_by) REFERENCES public.user_account(user_id);


--
-- Name: vital_signs fkrjm22151uydx12n0ojul0stjl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vital_signs
    ADD CONSTRAINT fkrjm22151uydx12n0ojul0stjl FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id);


--
-- Name: form form_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT form_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(user_id);


--
-- Name: invoice_detail invoice_detail_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_detail
    ADD CONSTRAINT invoice_detail_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoice(invoice_id);


--
-- Name: invoice_detail invoice_detail_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_detail
    ADD CONSTRAINT invoice_detail_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service(service_id);


--
-- Name: invoice invoice_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: option_choice option_choice_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.option_choice
    ADD CONSTRAINT option_choice_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: organization_member organization_member_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_member
    ADD CONSTRAINT organization_member_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organization(org_id);


--
-- Name: organization_member organization_member_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_member
    ADD CONSTRAINT organization_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(user_id);


--
-- Name: patient patient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(user_id);


--
-- Name: payment payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.payment_method(method_id);


--
-- Name: payment payment_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.payment_status(status_id);


--
-- Name: payment payment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(user_id);


--
-- Name: prescription_detail prescription_detail_medication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_detail
    ADD CONSTRAINT prescription_detail_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medication(medication_id);


--
-- Name: prescription_detail prescription_detail_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_detail
    ADD CONSTRAINT prescription_detail_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescription(prescription_id);


--
-- Name: prescription prescription_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visit(visit_id);


--
-- Name: question question_question_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_question_type_id_fkey FOREIGN KEY (question_type_id) REFERENCES public.question_type(question_type_id);


--
-- Name: room room_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room
    ADD CONSTRAINT room_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinic(clinic_id);


--
-- Name: section section_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.form(form_id);


--
-- Name: section_question section_question_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_question
    ADD CONSTRAINT section_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: section_question section_question_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_question
    ADD CONSTRAINT section_question_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(section_id);


--
-- Name: user_account user_account_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id);


--
-- Name: visit visit_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctor(doctor_id);


--
-- Name: visit visit_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit
    ADD CONSTRAINT visit_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.room(room_id);


--
-- PostgreSQL database dump complete
--

