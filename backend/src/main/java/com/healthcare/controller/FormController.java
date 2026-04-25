package com.healthcare.controller;

import com.healthcare.dto.AnswerSessionResponse;
import com.healthcare.dto.AnswerSubmissionRequest;
import com.healthcare.dto.FormListItemResponse;
import com.healthcare.dto.FormResponse;
import com.healthcare.dto.FormUpsertRequest;
import com.healthcare.service.FormService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/{formId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF')")
    public FormResponse getForm(@PathVariable UUID formId) {
        return formService.get(formId);
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public FormResponse create(@Valid @RequestBody FormUpsertRequest request) {
        return formService.create(request);
    }

    @PutMapping("/{formId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public FormResponse update(@PathVariable UUID formId, @Valid @RequestBody FormUpsertRequest request) {
        return formService.update(formId, request);
    }

    @DeleteMapping("/{formId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public void delete(@PathVariable UUID formId) {
        formService.delete(formId);
    }

    @PostMapping("/{formId}/publish")
    @PreAuthorize("hasRole('DOCTOR')")
    public FormResponse publish(@PathVariable UUID formId) {
        return formService.publish(formId);
    }

    @PostMapping("/{formId}/archive")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public FormResponse archive(@PathVariable UUID formId) {
        return formService.archive(formId);
    }

    @PostMapping("/{formId}/unarchive")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public FormResponse unarchive(@PathVariable UUID formId) {
        return formService.unarchive(formId);
    }

    @PostMapping("/{formId}/draft")
    @PreAuthorize("hasAnyRole('DOCTOR','STAFF','PATIENT')")
    public AnswerSessionResponse saveDraft(@PathVariable UUID formId, @Valid @RequestBody AnswerSubmissionRequest request) {
        return formService.saveDraft(formId, request);
    }

    @PostMapping("/{formId}/submit")
    @PreAuthorize("hasAnyRole('DOCTOR','STAFF','PATIENT')")
    public AnswerSessionResponse submit(@PathVariable UUID formId, @Valid @RequestBody AnswerSubmissionRequest request) {
        return formService.submit(formId, request);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PATIENT')")
    public List<AnswerSessionResponse> history() {
        return formService.historyForCurrentPatient();
    }
}