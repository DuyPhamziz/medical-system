package com.healthcare.service;

import com.healthcare.dto.AnswerSessionResponse;
import com.healthcare.dto.AnswerSubmissionRequest;
import com.healthcare.entity.*;
import com.healthcare.repository.AnswerSessionRepository;
import com.healthcare.repository.FormAnswerRepository;
import com.healthcare.repository.FormRepository;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.FormPermissionService;
import com.healthcare.service.engine.FormEngine;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FormSubmissionService {
    private final FormRepository formRepository;
    private final AnswerSessionRepository answerSessionRepository;
    private final FormAnswerRepository formAnswerRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FormPermissionService formPermissionService;
    private final FormEngine formEngine;
    private final ObjectMapper objectMapper;
    private final FormAnswerProcessingService formAnswerProcessingService;
    private final FormSubmissionValidator submissionValidator;
    private final FormMapper formMapper;

    @Transactional
    public AnswerSessionResponse saveDraft(UUID formId, AnswerSubmissionRequest request) {
        return saveAnswerSession(formId, request, AnswerSessionStatus.DRAFT);
    }

    @Transactional
    public AnswerSessionResponse submit(UUID formId, AnswerSubmissionRequest request) {
        return saveAnswerSession(formId, request, AnswerSessionStatus.SUBMITTED);
    }

    @Transactional(readOnly = true)
    public List<AnswerSessionResponse> historyForCurrentPatient() {
        Patient patient = currentPatient();
        return answerSessionRepository.findByPatient_PatientIdOrderByLastSavedAtDesc(patient.getPatientId())
                .stream()
                .map(session -> formMapper.toAnswerSessionResponse(session, session.getAnswers()))
                .toList();
    }

    private AnswerSessionResponse saveAnswerSession(UUID formId, AnswerSubmissionRequest request, AnswerSessionStatus targetStatus) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (!formPermissionService.canFillForm(form)) {
            throw new IllegalArgumentException("No permission to submit answers for this form");
        }

        FormEngine.PreparedAnswers prepared = formEngine.prepareAnswers(form, request.getAnswers());

        if (targetStatus == AnswerSessionStatus.SUBMITTED) {
            if (!prepared.isValid()) {
                throw new IllegalArgumentException("Validation failed: " + String.join("; ", prepared.getValidationErrors()));
            }
            submissionValidator.validateRequiredAnswers(form, request.getAnswers());
        }

        Patient patient = resolvePatient(request.getPatientId());
        AnswerSession session = request.getSessionId() == null
                ? null
                : answerSessionRepository.findWithGraphBySessionId(request.getSessionId()).orElse(null);

        if (session == null) {
            session = new AnswerSession();
            session.setForm(form);
            session.setPatient(patient);
            session.setVisitId(request.getVisitId());
            session.setSource(isDoctorContext() ? AnswerSource.DOCTOR : AnswerSource.PATIENT);
        }

        session.setStatus(targetStatus);
        if (targetStatus == AnswerSessionStatus.SUBMITTED) {
            session.setSubmittedAt(java.time.LocalDateTime.now());
            session.setSubmittedBy(currentUser());
        }

        formAnswerRepository.deleteBySession_SessionId(session.getSessionId());
        formAnswerRepository.flush();

        BigDecimal totalScore = BigDecimal.ZERO;
        List<FormAnswer> savedAnswers = new ArrayList<>();

        for (AnswerSubmissionRequest.AnswerItem item : request.getAnswers()) {
            FormQuestion question = findQuestion(form, item.getQuestionId());
            FormQuestionOption option = item.getOptionId() == null ? null : findOption(question, item.getOptionId());

            FormAnswer answer = FormAnswer.builder()
                    .session(session)
                    .question(question)
                    .option(option)
                    .repeatIndex(item.getRepeatIndex() == null ? 0 : item.getRepeatIndex())
                    .valueText(item.getValueText())
                    .valueNumber(item.getValueNumber())
                    .valueDate(item.getValueDate())
                    .valueBoolean(item.getValueBoolean())
                    .valueJson(item.getValueJson())
                    .build();
            savedAnswers.add(answer);
            if (option != null && option.getScore() != null) {
                totalScore = totalScore.add(option.getScore());
            }
        }

        final AnswerSession savedSession = answerSessionRepository.save(session);
        savedAnswers.forEach(a -> a.setSession(savedSession));
        List<FormAnswer> persistedAnswers = formAnswerRepository.saveAll(savedAnswers);
        formAnswerRepository.flush();

        Map<String, Object> answerValuesMap = buildAnswerValuesMap(persistedAnswers);
        for (FormAnswer answer : persistedAnswers) {
            formAnswerProcessingService.processAnswer(answer, answerValuesMap);
        }
        formAnswerRepository.saveAll(persistedAnswers);

        Map<String, Object> computedValues = prepared.getComputedValues();
        if (computedValues != null) {
            List<FormAnswer> computedAnswers = new ArrayList<>();
            for (Map.Entry<String, Object> entry : computedValues.entrySet()) {
                FormQuestion computedQuestion = findComputedQuestion(form, entry.getKey());
                if (computedQuestion != null) {
                    boolean alreadySaved = request.getAnswers().stream()
                            .anyMatch(a -> a.getQuestionId().equals(computedQuestion.getQuestionId()));
                    if (!alreadySaved) {
                        computedAnswers.add(FormAnswer.builder()
                                .session(savedSession)
                                .question(computedQuestion)
                                .repeatIndex(0)
                                .valueJson(serializeValue(entry.getValue()))
                                .build());
                    }
                }
            }
            if (!computedAnswers.isEmpty()) {
                formAnswerRepository.saveAll(computedAnswers);
                persistedAnswers.addAll(computedAnswers);
            }
        }

        savedSession.setTotalScore(totalScore);
        answerSessionRepository.save(savedSession);

        return formMapper.toAnswerSessionResponse(savedSession, persistedAnswers);
    }

    private FormQuestion findQuestion(Form form, UUID questionId) {
        return form.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .filter(question -> question.getQuestionId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
    }

    private FormQuestionOption findOption(FormQuestion question, UUID optionId) {
        return question.getOptions().stream()
                .filter(option -> option.getOptionId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Option not found"));
    }

    private User currentUser() {
        return formPermissionService.getCurrentUser();
    }

    private boolean isDoctorContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .map(Object::toString)
                .anyMatch(authority -> authority.contains("DOCTOR") || authority.contains("STAFF"));
    }

    private Patient resolvePatient(UUID patientId) {
        if (patientId != null) {
            return patientRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        }
        return currentPatient();
    }

    private Patient currentPatient() {
        User user = currentUser();
        return patientRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
    }

    private FormQuestion findComputedQuestion(Form form, String fieldName) {
        return form.getSections().stream()
                .flatMap(s -> s.getQuestions().stream())
                .filter(q -> {
                    String configJson = q.getConfigJson();
                    if (configJson == null) return false;
                    try {
                        JsonNode config = objectMapper.readTree(configJson);
                        String name = config.has("fieldName") ? config.get("fieldName").asText() : null;
                        return fieldName.equals(name);
                    } catch (Exception e) { return false; }
                })
                .findFirst()
                .orElse(null);
    }

    private String serializeValue(Object value) {
        if (value == null) return null;
        try { return objectMapper.writeValueAsString(value); } catch (Exception e) { return value.toString(); }
    }

    private Map<String, Object> buildAnswerValuesMap(List<FormAnswer> answers) {
        Map<String, Object> answerMap = new HashMap<>();
        for (FormAnswer answer : answers) {
            UUID questionId = answer.getQuestion().getQuestionId();
            Object value = extractAnswerValueFromFormAnswer(answer);
            answerMap.put(questionId.toString(), value);
        }
        return answerMap;
    }

    private Object extractAnswerValueFromFormAnswer(FormAnswer answer) {
        if (answer.getValueNumber() != null) return answer.getValueNumber();
        if (answer.getValueText() != null) return answer.getValueText();
        if (answer.getValueBoolean() != null) return answer.getValueBoolean();
        if (answer.getValueDate() != null) return answer.getValueDate();
        if (answer.getValueJson() != null) return answer.getValueJson();
        return null;
    }
}
