========================
🧠 CDSS (CLINICAL DECISION SUPPORT SYSTEM)
==========================================

This system provides rule-based clinical decision support based on patient answers.

CDSS must be:

* deterministic
* explainable
* configurable (NOT hardcoded)
* safe for medical context

========================
🚨 CRITICAL RULES
=================

* DO NOT hardcode medical logic in frontend

* DO NOT embed clinical rules directly in controller

* ALL CDSS logic must go through FormLogicService (or dedicated CDSS service)

* Backend = source of truth

* Frontend = display only

========================
📦 INPUT
========

CDSS input comes from:

* answer_session
* form_answer (questionId + value + repeat_index)

Optional:

* patient profile (age, gender, history)

========================
📤 OUTPUT
=========

CDSS must return structured results:

{
"riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
"recommendations": [],
"alerts": [],
"nextActions": [],
"score": number,
"explanations": []
}

DO NOT return plain text only.

========================
🧠 RULE TYPES
=============

1. Threshold rule:

* e.g. temperature > 38.5 → fever risk

2. Combination rule:

* multiple conditions (AND / OR)

3. Score-based rule:

* accumulate points → classify risk

4. Conditional branching:

* if X → evaluate sub-rule set

========================
📐 RULE FORMAT (JSON)
=====================

All rules must be configurable via JSON:

{
"conditions": [
{
"questionId": "q1",
"operator": ">",
"value": 38.5
}
],
"logic": "AND",
"result": {
"riskLevel": "HIGH",
"addScore": 10,
"recommendations": ["Visit doctor"]
}
}

========================
⚙️ EXECUTION FLOW
=================

1. Collect answers
2. Normalize values
3. Evaluate rules
4. Aggregate results
5. Return structured output

========================
📊 SCORING SYSTEM
=================

* Each rule can contribute score
* Final score determines risk level

Example:
0–10 → LOW
11–20 → MEDIUM
21–30 → HIGH

========================
🔍 EXPLAINABILITY (VERY IMPORTANT)
==================================

Each decision must include explanation:

* which rule triggered
* which answer caused it

Example:

{
"explanations": [
"Fever detected (temperature > 38.5)",
"Cough + fatigue combination"
]
}

========================
🔁 REPEATING GROUP SUPPORT
==========================

* CDSS must support repeat_index
* Evaluate per instance OR aggregated

Example:

* symptoms per family member
* multiple occurrences

========================
🧾 VERSIONING
=============

* CDSS must use form_version
* old submissions must be evaluated using correct rule set

========================
💻 BACKEND IMPLEMENTATION
=========================

Use:

FormLogicService OR CdssService

Responsibilities:

* evaluate rules
* compute score
* generate output

DO NOT:

* put CDSS logic in controller
* put CDSS logic in repository

========================
💻 FRONTEND USAGE
=================

Frontend must:

* display CDSS result
* highlight risk level
* show recommendations

Frontend must NOT:

* compute CDSS logic
* modify CDSS results

========================
⚠️ SAFETY RULES
===============

* DO NOT provide diagnosis
* DO NOT claim medical certainty
* ALWAYS phrase as support / recommendation

========================
📌 EXTENSIBILITY
================

System must allow:

* adding new rule sets
* updating thresholds
* enabling/disabling rules

WITHOUT code changes

========================
❗ WHEN UNSURE
=============

* mark as UNKNOWN
* do not guess medical logic
