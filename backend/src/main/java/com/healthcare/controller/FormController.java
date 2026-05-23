package com.healthcare.controller;

import com.healthcare.dto.AnswerSessionResponse;
import com.healthcare.dto.AnswerSubmissionRequest;
import com.healthcare.dto.FormListItemResponse;
import com.healthcare.dto.FormResponse;
import com.healthcare.dto.FormStateResponse;
import com.healthcare.dto.FormUpsertRequest;
import com.healthcare.service.FormService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forms")
public class FormController {
    private final FormService formService;

    public FormController(FormService formService) {
        this.formService = formService;
    }

    @GetMapping("/public")
    public List<FormListItemResponse> publicForms() {
        return formService.listPublicForms();
    }

    @GetMapping("/public/{formId}")
    public FormResponse publicForm(@PathVariable UUID formId) {
        return formService.getPublic(formId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF')")
    public List<FormListItemResponse> listForms() {
        return formService.listAllForms();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF')")
    public List<FormListItemResponse> listMyForms() {
        return formService.listMyForms();
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF')")
    public List<FormListItemResponse> listTemplates() {
        return formService.listTemplates();
    }

    @GetMapping("/{formId}")
    @PreAuthorize("isAuthenticated()")
    public FormResponse getForm(@PathVariable UUID formId) {
        try {
            return formService.get(formId);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    @PostMapping("/{formId}/logic")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Boolean> evaluateLogic(@PathVariable UUID formId, @RequestBody(required = false) Map<String, Object> answers) {
        Map<UUID, Object> uuidAnswers = answers != null ? answers.entrySet().stream()
                .filter(e -> !e.getKey().startsWith("sessionId") && !e.getKey().startsWith("patientId"))
                .map(e -> {
                    try {
                        return Map.entry(UUID.fromString(e.getKey()), e.getValue());
                    } catch (IllegalArgumentException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                )) : Map.of();
        return formService.evaluateLogic(formId, uuidAnswers);
    }

    @PostMapping
    @PreAuthorize("@formPermissionService.canCreate()")
    public FormResponse create(@Valid @RequestBody FormUpsertRequest request) {
        return formService.create(request);
    }

    @PutMapping("/{formId}")
    @PreAuthorize("@formPermissionService.canEdit(#formId)")
    public FormResponse update(@PathVariable UUID formId, @Valid @RequestBody FormUpsertRequest request) {
        return formService.update(formId, request);
    }

    @DeleteMapping("/{formId}")
    @PreAuthorize("@formPermissionService.canEdit(#formId)")
    public void delete(@PathVariable UUID formId) {
        formService.delete(formId);
    }

    @PostMapping("/{formId}/publish")
    @PreAuthorize("@formPermissionService.canPublish(#formId)")
    public FormResponse publish(@PathVariable UUID formId) {
        return formService.publish(formId);
    }

    @PostMapping("/{formId}/archive")
    @PreAuthorize("@formPermissionService.canArchive(#formId)")
    public FormResponse archive(@PathVariable UUID formId) {
        return formService.archive(formId);
    }

    @PostMapping("/{formId}/unarchive")
    @PreAuthorize("@formPermissionService.canArchive(#formId)")
    public FormResponse unarchive(@PathVariable UUID formId) {
        return formService.unarchive(formId);
    }

    @PostMapping("/{formId}/clone")
    @PreAuthorize("@formPermissionService.canClone(#formId)")
    public FormResponse clone(@PathVariable UUID formId) {
        return formService.cloneForm(formId);
    }

    @PostMapping("/{formId}/draft")
    @PreAuthorize("@formPermissionService.canFillForm(#formId)")
    public AnswerSessionResponse saveDraft(@PathVariable UUID formId, @Valid @RequestBody AnswerSubmissionRequest request) {
        return formService.saveDraft(formId, request);
    }

    @PostMapping("/{formId}/submit")
    @PreAuthorize("@formPermissionService.canFillForm(#formId)")
    public AnswerSessionResponse submit(@PathVariable UUID formId, @Valid @RequestBody AnswerSubmissionRequest request) {
        return formService.submit(formId, request);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PATIENT')")
    public List<AnswerSessionResponse> history() {
        return formService.historyForCurrentPatient();
    }

    @PostMapping("/{formId}/state")
    @PreAuthorize("@formPermissionService.canView(#formId)")
    public FormStateResponse evaluateState(@PathVariable UUID formId, @RequestBody(required = false) Map<String, Object> answers) {
        // Convert string keys to UUIDs for the map
        Map<UUID, Object> uuidAnswers = answers != null ? answers.entrySet().stream()
                .map(e -> {
                    try {
                        return Map.entry(UUID.fromString(e.getKey()), e.getValue());
                    } catch (IllegalArgumentException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                )) : Map.of();
        return formService.evaluateFormState(formId, uuidAnswers);
    }
}
