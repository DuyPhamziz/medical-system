package com.healthcare.service;

import com.healthcare.dto.*;
import com.healthcare.entity.*;
import com.healthcare.entity.enums.FormVisibility;
import com.healthcare.repository.FormRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.FormPermissionService;
import com.healthcare.service.engine.FormEngine;
import com.healthcare.service.FormLogicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class FormService {
    private final FormRepository formRepository;
    private final UserRepository userRepository;
    private final FormPermissionService formPermissionService;
    private final FormSubmissionService formSubmissionService;
    private final FormMapper formMapper;
    private final FormEngine formEngine;
    private final FormLogicService formLogicService;

    public FormService(
            FormRepository formRepository,
            UserRepository userRepository,
            FormPermissionService formPermissionService,
            FormSubmissionService formSubmissionService,
            FormMapper formMapper,
            FormEngine formEngine,
            FormLogicService formLogicService
    ) {
        this.formRepository = formRepository;
        this.userRepository = userRepository;
        this.formPermissionService = formPermissionService;
        this.formSubmissionService = formSubmissionService;
        this.formMapper = formMapper;
        this.formEngine = formEngine;
        this.formLogicService = formLogicService;
    }

    @Transactional
    public FormResponse create(FormUpsertRequest request) {
        User user = currentUser();
        if (user == null) throw new IllegalArgumentException("User not found or not authenticated");
        formPermissionService.assertCanCreate();
        
        Form form = new Form();
        form.setCreatedBy(user);
        form.setStatus(FormStatus.DRAFT);
        form.setVersion(1);
        updateFormFields(form, request);
        return formMapper.toResponse(formRepository.save(form));
    }

    @Transactional
    public FormResponse update(UUID formId, FormUpsertRequest request) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanEdit(form);
        form.setVersion(form.getVersion() + 1);
        updateFormFields(form, request);
        return formMapper.toResponse(formRepository.save(form));
    }

    private void updateFormFields(Form form, FormUpsertRequest request) {
        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setTemplate(request.isTemplate());
        form.setPublicForm(request.isPublicForm());
        form.setPaid(request.isPaid());
        form.setPrice(request.getPrice() == null ? BigDecimal.ZERO : request.getPrice());
        form.setVisibility(request.isPublicForm() ? FormVisibility.PUBLIC : formMapper.parseVisibility(request.getVisibility()));
        formMapper.applyStructure(form, request);
    }

    @Transactional
    public void delete(UUID id) {
        Form f = formRepository.findById(id).orElseThrow();
        formPermissionService.assertCanDelete(f);
        formRepository.delete(f);
    }

    @Transactional
    public FormResponse publish(UUID id) {
        Form f = formRepository.findWithGraphByFormId(id).orElseThrow();
        formPermissionService.assertCanPublish(f);
        f.setStatus(FormStatus.PUBLISHED);
        f.setPublishedAt(java.time.LocalDateTime.now());
        if (f.getVisibility() == FormVisibility.PUBLIC) f.setPublicForm(true);
        return formMapper.toResponse(formRepository.save(f));
    }

    @Transactional
    public FormResponse archive(UUID id) {
        Form f = formRepository.findWithGraphByFormId(id).orElseThrow();
        if (!formPermissionService.canArchive(f)) throw new IllegalArgumentException("Denied");
        f.setStatus(FormStatus.ARCHIVED);
        return formMapper.toResponse(formRepository.save(f));
    }

    @Transactional
    public FormResponse unarchive(UUID id) {
        Form f = formRepository.findWithGraphByFormId(id).orElseThrow();
        if (!formPermissionService.canArchive(f)) throw new IllegalArgumentException("Denied");
        f.setStatus(FormStatus.DRAFT);
        return formMapper.toResponse(formRepository.save(f));
    }

    @Transactional
    public List<FormListItemResponse> listPublicForms() {
        return formRepository.findByStatusAndPublicFormTrueOrderByUpdatedAtDesc(FormStatus.PUBLISHED)
                .stream().map(formMapper::toListItem).toList();
    }

    @Transactional
    public List<FormListItemResponse> listAllForms() {
        return formRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(formPermissionService::canView).map(formMapper::toListItem).toList();
    }

    @Transactional
    public FormResponse get(UUID id) {
        Form f = formRepository.findWithGraphByFormId(id)
                .orElseThrow(() -> {
                    // Log for debugging
                    System.err.println("FORM NOT FOUND: id=" + id + ", user=" + (currentUser() != null ? currentUser().getEmail() : "unauthenticated"));
                    return new IllegalArgumentException("Form not found with ID: " + id);
                });

        try {
            formPermissionService.assertCanView(f);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            // Log permission denial for debugging
            System.err.println("ACCESS DENIED: user=" + (currentUser() != null ? currentUser().getEmail() : "unauthenticated") +
                             ", formId=" + id +
                             ", formTemplate=" + f.isTemplate() +
                             ", formOwner=" + (f.getCreatedBy() != null ? f.getCreatedBy().getEmail() : "none") +
                             ", formStatus=" + (f.getStatus() != null ? f.getStatus().name() : "null"));
            throw e;
        }

        return formMapper.toResponse(f);
    }

    @Transactional
    public FormResponse cloneForm(UUID id) {
        Form src = formRepository.findWithGraphByFormId(id).orElseThrow();
        if (!src.isTemplate()) throw new IllegalArgumentException("Not template");
        formPermissionService.assertCanView(src);

        Form cloned = new Form();
        cloned.setTitle(src.getTitle() + " (Copy)");
        cloned.setCreatedBy(currentUser());
        cloned.setStatus(FormStatus.DRAFT);
        cloned.setVersion(1);
        // Simplified structure copy logic should be in a dedicated cloner or here
        formMapper.applyStructure(cloned, convertToRequest(src)); 
        return formMapper.toResponse(formRepository.save(cloned));
    }

    private FormUpsertRequest convertToRequest(Form src) {
        return FormUpsertRequest.builder()
                .title(src.getTitle())
                .description(src.getDescription())
                .template(src.isTemplate())
                .publicForm(src.isPublicForm())
                .visibility(src.getVisibility() == null ? "DOCTOR_ONLY" : src.getVisibility().name())
                .paid(src.isPaid())
                .price(src.getPrice())
                .sections(src.getSections().stream().map(s -> 
                    FormUpsertRequest.SectionRequest.builder()
                            .title(s.getTitle())
                            .description(s.getDescription())
                            .allowRepeat(s.isAllowRepeat())
                            .repeatLabel(s.getRepeatLabel())
                            .questions(s.getQuestions().stream().map(q -> 
                                FormUpsertRequest.QuestionRequest.builder()
                                        .content(q.getContent())
                                        .questionType(q.getQuestionType())
                                        .required(q.isRequired())
                                        .allowRepeat(q.isAllowRepeat())
                                        .orderIndex(q.getOrderIndex())
                                        .minValue(q.getMinValue())
                                        .maxValue(q.getMaxValue())
                                        .minLength(q.getMinLength())
                                        .maxLength(q.getMaxLength())
                                        .validationPattern(q.getValidationPattern())
                                        .validationMessage(q.getValidationMessage())
                                        .placeholder(q.getPlaceholder())
                                        .helperText(q.getHelperText())
                                        .scaleMin(q.getScaleMin())
                                        .scaleMax(q.getScaleMax())
                                        .triggerLogic(q.getTriggerLogic())
                                        .configJson(q.getConfigJson())
                                        .options(q.getOptions().stream().map(o -> 
                                            FormUpsertRequest.OptionRequest.builder()
                                                    .content(o.getContent())
                                                    .score(o.getScore())
                                                    .orderIndex(o.getOrderIndex())
                                                    .triggerLogic(o.getTriggerLogic())
                                                    .build()
                                        ).toList())
                                        .build()
                            ).toList())
                            .build()
                ).toList())
                .build();
    }

    @Transactional public AnswerSessionResponse saveDraft(UUID id, AnswerSubmissionRequest r) { return formSubmissionService.saveDraft(id, r); }
    @Transactional public AnswerSessionResponse submit(UUID id, AnswerSubmissionRequest r) { return formSubmissionService.submit(id, r); }
    @Transactional public List<AnswerSessionResponse> history() { return formSubmissionService.historyForCurrentPatient(); }
    @Transactional public List<AnswerSessionResponse> historyForCurrentPatient() { return formSubmissionService.historyForCurrentPatient(); }

    @Transactional
    public FormStateResponse evaluateFormState(UUID id, Map<UUID, Object> answers) {
        Form f = formRepository.findWithGraphByFormId(id).orElseThrow();
        formPermissionService.assertCanView(f);
        FormEngine.FormState s = formEngine.evaluateFormState(f, answers);
        return FormStateResponse.builder().formId(id).computedValues(s.getComputedValues()).build();
    }

    @Transactional(readOnly = true)
    public FormResponse getPublic(UUID formId) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        if (!form.isPublicForm() || form.getStatus() != FormStatus.PUBLISHED) {
            throw new IllegalArgumentException("Form is not publicly available");
        }
        return formMapper.toResponse(form);
    }

    @Transactional(readOnly = true)
    public List<FormListItemResponse> listMyForms() {
        User currentUser = currentUser();
        return formRepository.findAllByCreatedBy_UserIdOrderByUpdatedAtDesc(currentUser.getUserId()).stream()
                .map(formMapper::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FormListItemResponse> listTemplates() {
        User currentUser = currentUser();
        return formRepository.findByTemplateTrueAndCreatedBy_UserIdOrderByUpdatedAtDesc(currentUser.getUserId()).stream()
                .map(formMapper::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Boolean> evaluateLogic(UUID formId, Map<UUID, Object> answers) {
        Form form = formRepository.findWithGraphByFormId(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));
        formPermissionService.assertCanView(form);
        return formLogicService.evaluateVisibility(form, answers);
    }

    private User currentUser() { return formPermissionService.getCurrentUser(); }
}
