package com.healthcare.controller;

import com.healthcare.dto.PatientResponse;
import com.healthcare.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    private final PatientService patientService;
    private final com.healthcare.service.AuditService auditService;

    public PatientController(PatientService patientService, com.healthcare.service.AuditService auditService) {
        this.patientService = patientService;
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("@patientPermissionService.canListPatients()")
    public ResponseEntity<List<PatientResponse>> list() {
        auditService.logAction("LIST_PATIENTS", "PATIENT", "ALL", "User listed all patients");
        return ResponseEntity.ok(patientService.listAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@patientPermissionService.canViewPatient(#id)")
    public ResponseEntity<PatientResponse> get(@PathVariable UUID id) {
        auditService.logAction("VIEW_PATIENT", "PATIENT", id.toString(), "User viewed patient details");
        return ResponseEntity.ok(patientService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@patientPermissionService.canUpdatePatient(#id)")
    public ResponseEntity<PatientResponse> update(@PathVariable UUID id, @RequestBody PatientResponse request) {
        auditService.logAction("UPDATE_PATIENT", "PATIENT", id.toString(), "User updated patient profile");
        return ResponseEntity.ok(patientService.update(id, request));
    }
}
