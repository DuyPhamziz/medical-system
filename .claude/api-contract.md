========================
📡 BACKEND API CONTRACT
=======================

This project already has a defined API contract.

DO NOT:

* create duplicate endpoints
* rename existing endpoints
* change request/response format

========================
🔐 AUTH MODULE
==============

/api/auth/register
/api/auth/login
/api/auth/me

========================
👤 USER MODULE
==============

/api/users/me
/api/users/update

========================
📋 FORM MODULE
==============

/api/forms (GET, POST)
/api/forms/{id} (GET, PUT, DELETE)

========================
❗ IMPORTANT
===========

* /api/forms/{id} returns STRUCTURE (admin view)
* NOT suitable for patient rendering

========================
❓ QUESTION MODULE
=================

/api/questions (POST)
/api/questions/{id} (PUT, DELETE)

========================
🧾 ANSWER MODULE
================

/api/answers/start

Creates answer_session

========================
🚨 REQUIRED EXTENSION
=====================

You MUST ADD (NOT MODIFY):

1. GET /api/forms/{id}/render
   → return runtime form (groups + questions)

2. POST /api/forms/{id}/submit
   → save answers to:

   * answer_session
   * form_answer

========================
📌 RULES
========

* reuse existing answer_session
* reuse existing form_answer
* do NOT create new answer tables

========================
🔗 FLOW
=======

1. start:
   POST /api/answers/start

2. render:
   GET /api/forms/{id}/render

3. submit:
   POST /api/forms/{id}/submit
