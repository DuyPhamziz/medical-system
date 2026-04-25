package com.healthcare.service;

import com.healthcare.dto.AnswerSessionResponse;
import com.healthcare.dto.AnswerSubmissionRequest;
import com.healthcare.dto.FormListItemResponse;
import com.healthcare.dto.FormResponse;
import com.healthcare.dto.FormUpsertRequest;
import com.healthcare.entity.*;
import com.healthcare.entity.enums.FormVisibility;
import com.healthcare.repository.AnswerSessionRepository;
import com.healthcare.repository.FormAnswerRepository;
import com.healthcare.repository.FormRepository;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.FormPermissionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FormService {
    private final FormRepository formRepository;
    private final AnswerSessionRepository answerSessionRepository;
    private final FormAnswerRepository formAnswerRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FormPermissionService formPermissionService;

    public FormService(
            FormRepository formRepository,
            AnswerSessionRepository answerSessionRepository,
            FormAnswerRepository formAnswerRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            FormPermissionService formPermissionService
    ) {
        this.formRepository = formRepository;
        this.answerSessionRepository = answerSessionRepository;
        this.formAnswerRepository = formAnswerRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.formPermissionService = formPermissionService;
    }

    @Transactional
    public FormResponse create(FormUpsertRequest request) {
        formPermissionService.assertCanCreate();
        User currentUser = currentUser();
        Form form = new Form();
        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setTemplate(request.isTemplate());
        form.setPublicForm(request.isPublicForm());
        form.setPaid(request.isPaid());
        form.setPrice(request.getPrice() == null ? BigDecimal.ZERO : request.getPrice());
        form.setStatus(FormStatus.DRAFT);
        form.setVersion(1);
        form.setCreatedBy(currentUser);
        form.setVisibility(parseVisibility(request.getVisibility()));
        applyStructure(form, request);
        return toResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse update(UUID formId, FormUpsertRequest request) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanEdit(form);

        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setTemplate(request.isTemplate());
        form.setPublicForm(request.isPublicForm());
        form.setPaid(request.isPaid());
        form.setPrice(request.getPrice() == null ? BigDecimal.ZERO : request.getPrice());
        form.setVisibility(parseVisibility(request.getVisibility()));
        form.setVersion(form.getVersion() + 1);
        applyStructure(form, request);
        return toResponse(formRepository.save(form));
    }

    @Transactional
    public void delete(UUID formId) {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanDelete(form);
        formRepository.delete(form);
    }

    @Transactional
    public FormResponse publish(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanPublish(form);
        form.setStatus(FormStatus.PUBLISHED);
        if (form.getVisibility() == FormVisibility.PUBLIC) {
            form.setPublicForm(true);
        }
        form.setPublishedAt(java.time.LocalDateTime.now());
        return toResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse archive(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (!formPermissionService.canArchive(form)) {
            throw new IllegalArgumentException("No permission to archive this form");
        }
        form.setStatus(FormStatus.ARCHIVED);
        form.setPublicForm(false);
        return toResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse unarchive(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (!formPermissionService.canArchive(form)) {
            throw new IllegalArgumentException("No permission to unarchive this form");
        }

        if (form.getStatus() == FormStatus.ARCHIVED) {
            form.setStatus(FormStatus.DRAFT);
        }

        if (form.getVisibility() == FormVisibility.PUBLIC) {
            form.setPublicForm(true);
        }

        return toResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse getPublic(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (form.getStatus() != FormStatus.PUBLISHED || !form.isPublicForm() || form.getVisibility() != FormVisibility.PUBLIC) {
            throw new IllegalArgumentException("Form is not publicly available");
        }
        return toResponse(form);
    }

    @Transactional
    public List<FormListItemResponse> listPublicForms() {
        return formRepository.findByStatusAndPublicFormTrueAndVisibilityOrderByUpdatedAtDesc(FormStatus.PUBLISHED, FormVisibility.PUBLIC)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Transactional
    public List<FormListItemResponse> listAllForms() {
        return formRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .filter(formPermissionService::canView)
                .map(this::toListItem)
                .toList();
    }

    @Transactional
    public FormResponse get(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
            .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanView(form);
        return toResponse(form);
    }

    @Transactional
    public AnswerSessionResponse saveDraft(UUID formId, AnswerSubmissionRequest request) {
        return saveAnswerSession(formId, request, AnswerSessionStatus.DRAFT);
    }

    @Transactional
    public AnswerSessionResponse submit(UUID formId, AnswerSubmissionRequest request) {
        return saveAnswerSession(formId, request, AnswerSessionStatus.SUBMITTED);
    }

    @Transactional
    public List<AnswerSessionResponse> historyForCurrentPatient() {
        Patient patient = currentPatient();
        return answerSessionRepository.findByPatient_PatientIdOrderByLastSavedAtDesc(patient.getPatientId())
                .stream()
                .map(this::toAnswerSessionResponse)
                .toList();
    }

    private AnswerSessionResponse saveAnswerSession(UUID formId, AnswerSubmissionRequest request, AnswerSessionStatus targetStatus) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (!formPermissionService.canFillForm(form)) {
            throw new IllegalArgumentException("No permission to submit answers for this form");
        }

        // Validate required fields only on submit (not on draft)
        if (targetStatus == AnswerSessionStatus.SUBMITTED) {
            validateRequiredAnswers(form, request.getAnswers());
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

        session.setForm(form);
        session.setPatient(patient);
        session.setVisitId(request.getVisitId());
        session.setStatus(targetStatus);
        session.setSource(isDoctorContext() ? AnswerSource.DOCTOR : AnswerSource.PATIENT);
        if (targetStatus == AnswerSessionStatus.SUBMITTED) {
            session.setSubmittedAt(java.time.LocalDateTime.now());
            session.setSubmittedBy(currentUser());
        }

        AnswerSession savedSession = answerSessionRepository.save(session);
        formAnswerRepository.deleteBySession_SessionId(savedSession.getSessionId());

        BigDecimal totalScore = BigDecimal.ZERO;
        for (AnswerSubmissionRequest.AnswerItem item : request.getAnswers()) {
            FormQuestion question = findQuestion(form, item.getQuestionId());
            FormQuestionOption option = item.getOptionId() == null ? null : findOption(question, item.getOptionId());

            FormAnswer answer = FormAnswer.builder()
                    .session(savedSession)
                    .question(question)
                    .option(option)
                    .repeatIndex(item.getRepeatIndex() == null ? 0 : item.getRepeatIndex())
                    .valueText(item.getValueText())
                    .valueNumber(item.getValueNumber())
                    .valueDate(item.getValueDate())
                    .valueBoolean(item.getValueBoolean())
                    .valueJson(item.getValueJson())
                    .build();
            formAnswerRepository.save(answer);
            if (option != null && option.getScore() != null) {
                totalScore = totalScore.add(option.getScore());
            }
        }

        savedSession.setTotalScore(totalScore);
        return toAnswerSessionResponse(answerSessionRepository.save(savedSession));
    }

    private void applyStructure(Form form, FormUpsertRequest request) {
        form.getSections().clear();
        int sectionIndex = 0;
        for (FormUpsertRequest.SectionRequest sectionRequest : request.getSections()) {
            FormSection section = FormSection.builder()
                    .form(form)
                    .title(sectionRequest.getTitle())
                    .description(sectionRequest.getDescription())
                    .allowRepeat(sectionRequest.isAllowRepeat())
                    .repeatLabel(sectionRequest.getRepeatLabel())
                    .orderIndex(sectionRequest.getQuestions().isEmpty() ? sectionIndex : sectionIndex)
                    .build();

            int questionIndex = 0;
            for (FormUpsertRequest.QuestionRequest questionRequest : sectionRequest.getQuestions()) {
                FormQuestion question = FormQuestion.builder()
                        .section(section)
                        .content(questionRequest.getContent())
                        .questionType(questionRequest.getQuestionType())
                        .required(questionRequest.isRequired())
                        .allowRepeat(questionRequest.isAllowRepeat())
                        .orderIndex(questionRequest.getOrderIndex() == null ? questionIndex : questionRequest.getOrderIndex())
                        .minValue(questionRequest.getMinValue())
                        .maxValue(questionRequest.getMaxValue())
                        .minLength(questionRequest.getMinLength())
                        .maxLength(questionRequest.getMaxLength())
                        .validationPattern(questionRequest.getValidationPattern())
                        .validationMessage(questionRequest.getValidationMessage())
                        .placeholder(questionRequest.getPlaceholder())
                        .helperText(questionRequest.getHelperText())
                        .scaleMin(questionRequest.getScaleMin())
                        .scaleMax(questionRequest.getScaleMax())
                        .build();

                int optionIndex = 0;
                for (FormUpsertRequest.OptionRequest optionRequest : questionRequest.getOptions()) {
                    FormQuestionOption option = FormQuestionOption.builder()
                            .question(question)
                            .content(optionRequest.getContent())
                            .score(optionRequest.getScore() == null ? BigDecimal.ZERO : optionRequest.getScore())
                            .orderIndex(optionRequest.getOrderIndex() == null ? optionIndex : optionRequest.getOrderIndex())
                            .triggerLogic(optionRequest.getTriggerLogic())
                            .build();
                    question.getOptions().add(option);
                    optionIndex++;
                }

                section.getQuestions().add(question);
                questionIndex++;
            }

            form.getSections().add(section);
            sectionIndex++;
        }
    }

    private FormResponse toResponse(Form form) {
        return FormResponse.builder()
                .formId(form.getFormId())
                .title(form.getTitle())
                .description(form.getDescription())
                .template(form.isTemplate())
                .publicForm(form.isPublicForm())
                .visibility(form.getVisibility() == null ? FormVisibility.DOCTOR_ONLY.name() : form.getVisibility().name())
                .paid(form.isPaid())
                .price(form.getPrice())
                .status(form.getStatus())
                .version(form.getVersion())
                .publishedAt(form.getPublishedAt())
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .createdById(form.getCreatedBy() == null ? null : form.getCreatedBy().getUserId())
                .createdByName(form.getCreatedBy() == null ? null : form.getCreatedBy().getUsername())
                .sections(form.getSections().stream().map(this::toSectionResponse).toList())
                .build();
    }

    private FormVisibility parseVisibility(String visibility) {
        if (visibility == null || visibility.isBlank()) {
            return FormVisibility.DOCTOR_ONLY;
        }
        try {
            return FormVisibility.valueOf(visibility);
        } catch (IllegalArgumentException ex) {
            return FormVisibility.DOCTOR_ONLY;
        }
    }

    private FormResponse.SectionResponse toSectionResponse(FormSection section) {
        return FormResponse.SectionResponse.builder()
                .sectionId(section.getSectionId())
                .title(section.getTitle())
                .description(section.getDescription())
                .orderIndex(section.getOrderIndex())
                .allowRepeat(section.isAllowRepeat())
                .repeatLabel(section.getRepeatLabel())
                .questions(section.getQuestions().stream().map(this::toQuestionResponse).toList())
                .build();
    }

    private FormResponse.QuestionResponse toQuestionResponse(FormQuestion question) {
        return FormResponse.QuestionResponse.builder()
                .questionId(question.getQuestionId())
                .content(question.getContent())
                .questionType(question.getQuestionType())
                .required(question.isRequired())
                .allowRepeat(question.isAllowRepeat())
                .orderIndex(question.getOrderIndex())
                .minValue(question.getMinValue())
                .maxValue(question.getMaxValue())
                .minLength(question.getMinLength())
                .maxLength(question.getMaxLength())
                .validationPattern(question.getValidationPattern())
                .validationMessage(question.getValidationMessage())
                .placeholder(question.getPlaceholder())
                .helperText(question.getHelperText())
                .scaleMin(question.getScaleMin())
                .scaleMax(question.getScaleMax())
                .options(question.getOptions().stream().map(this::toOptionResponse).toList())
                .build();
    }

    private FormResponse.OptionResponse toOptionResponse(FormQuestionOption option) {
        return FormResponse.OptionResponse.builder()
                .optionId(option.getOptionId())
                .content(option.getContent())
                .score(option.getScore())
                .orderIndex(option.getOrderIndex())
                .triggerLogic(option.getTriggerLogic())
                .build();
    }

    private FormListItemResponse toListItem(Form form) {
        return FormListItemResponse.builder()
                .formId(form.getFormId())
                .title(form.getTitle())
                .description(form.getDescription())
                .publicForm(form.isPublicForm())
                .paid(form.isPaid())
                .price(form.getPrice())
                .status(form.getStatus().name())
                .updatedAt(form.getUpdatedAt())
                .sectionCount(form.getSections().size())
                .build();
    }

    private AnswerSessionResponse toAnswerSessionResponse(AnswerSession session) {
        return AnswerSessionResponse.builder()
                .sessionId(session.getSessionId())
                .formId(session.getForm().getFormId())
                .patientId(session.getPatient().getPatientId())
                .visitId(session.getVisitId())
                .status(session.getStatus())
                .source(session.getSource())
                .startedAt(session.getStartedAt())
                .submittedAt(session.getSubmittedAt())
                .lastSavedAt(session.getLastSavedAt())
                .totalScore(session.getTotalScore())
                .answers(session.getAnswers().stream().map(answer -> AnswerSessionResponse.AnswerResponse.builder()
                        .answerId(answer.getAnswerId())
                        .questionId(answer.getQuestion().getQuestionId())
                        .optionId(answer.getOption() == null ? null : answer.getOption().getOptionId())
                        .repeatIndex(answer.getRepeatIndex())
                        .valueText(answer.getValueText())
                        .valueNumber(answer.getValueNumber())
                        .valueDate(answer.getValueDate())
                        .valueBoolean(answer.getValueBoolean())
                        .valueJson(answer.getValueJson())
                        .build()).toList())
                .build();
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated user");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Patient required");
        }

        return patientRepository.findByUser_Email(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
    }

    private Patient currentPatient() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated user");
        }

        return patientRepository.findByUser_Email(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
    }

    private void validateRequiredAnswers(Form form, List<AnswerSubmissionRequest.AnswerItem> answers) {
        // Build a map of questionId -> list of answers for that question
        Map<UUID, List<AnswerSubmissionRequest.AnswerItem>> answersByQuestion = answers.stream()
                .collect(Collectors.groupingBy(AnswerSubmissionRequest.AnswerItem::getQuestionId));

        for (FormSection section : form.getSections()) {
            for (FormQuestion question : section.getQuestions()) {
                if (!question.isRequired()) {
                    continue;
                }

                List<AnswerSubmissionRequest.AnswerItem> questionAnswers = answersByQuestion.get(question.getQuestionId());
                boolean isRepeatable = section.isAllowRepeat() || question.isAllowRepeat();

                if (questionAnswers == null || questionAnswers.isEmpty()) {
                    throw new IllegalArgumentException("Required question is missing answer: " + question.getContent());
                }

                // Group answers by repeat index
                Map<Integer, List<AnswerSubmissionRequest.AnswerItem>> answersByRepeat = questionAnswers.stream()
                        .collect(Collectors.groupingBy(
                                item -> item.getRepeatIndex() == null ? 0 : item.getRepeatIndex()
                        ));

                // Find the maximum repeat index
                int maxRepeatIndex = answersByRepeat.keySet().stream().max(Integer::compareTo).orElse(0);

                // For repeatable questions, ensure each repeat index from 0 to max has a valid answer
                // For non-repeatable, just need one valid answer
                if (isRepeatable) {
                    for (int repeatIndex = 0; repeatIndex <= maxRepeatIndex; repeatIndex++) {
                        List<AnswerSubmissionRequest.AnswerItem> repeatAnswers = answersByRepeat.get(repeatIndex);
                        if (repeatAnswers == null || repeatAnswers.isEmpty()) {
                            throw new IllegalArgumentException("Required question missing answer for repeat #" + (repeatIndex + 1) + ": " + question.getContent());
                        }
                        // Check if at least one answer in this repeat is valid
                        boolean validInRepeat = repeatAnswers.stream().anyMatch(answer -> isAnswerValid(answer, question.getQuestionType()));
                        if (!validInRepeat) {
                            throw new IllegalArgumentException("Required question has no valid answer for repeat #" + (repeatIndex + 1) + ": " + question.getContent());
                        }
                    }
                } else {
                    // Non-repeatable: at least one valid answer among all
                    boolean hasValid = questionAnswers.stream().anyMatch(answer -> isAnswerValid(answer, question.getQuestionType()));
                    if (!hasValid) {
                        throw new IllegalArgumentException("Required question has no valid answer: " + question.getContent());
                    }
                }
            }
        }
    }

    private boolean isAnswerValid(AnswerSubmissionRequest.AnswerItem answer, QuestionType questionType) {
        switch (questionType) {
            case TEXT:
                return answer.getValueText() != null && !answer.getValueText().trim().isEmpty();
            case NUMBER:
            case SCALE:
                return answer.getValueNumber() != null;
            case DATE:
                return answer.getValueDate() != null;
            case SINGLE_CHOICE:
                return answer.getOptionId() != null;
            case MULTIPLE_CHOICE:
                if (answer.getValueJson() == null) return false;
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode node = mapper.readTree(answer.getValueJson());
                    if (node.isArray()) {
                        return node.size() > 0;
                    }
                    return false;
                } catch (Exception e) {
                    // If not valid JSON, check comma-separated
                    String[] parts = answer.getValueJson().split(",");
                    return parts.length > 0 && !parts[0].trim().isEmpty();
                }
            default:
                return false;
        }
    }
}