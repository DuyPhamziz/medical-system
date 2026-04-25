package com.healthcare.controller;

import com.healthcare.dto.PatientFormResponse;
import com.healthcare.dto.PatientResponse;
import com.healthcare.dto.PatientUpdateRequest;
import com.healthcare.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF','PATIENT')")
    public PatientResponse getPatient(@PathVariable UUID patientId) {
        return patientService.getPatientById(patientId);
    }

    @PutMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public PatientResponse updatePatient(@PathVariable UUID patientId, @Valid @RequestBody PatientUpdateRequest request) {
        return patientService.updatePatient(patientId, request);
    }

    @GetMapping("/{patientId}/forms")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','STAFF','PATIENT')")
    public List<PatientFormResponse> getPatientForms(@PathVariable UUID patientId) {
        return patientService.getPatientForms(patientId);
    }
}
