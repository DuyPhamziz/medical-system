package com.healthcare.controller;

import com.healthcare.dto.VitalSignsResponse;
import com.healthcare.service.VitalSignsService;
import com.healthcare.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/vitals")
public class VitalSignsController {
    private final VitalSignsService vitalSignsService;
    private final AuditService auditService;

    public VitalSignsController(VitalSignsService vitalSignsService, AuditService auditService) {
        this.vitalSignsService = vitalSignsService;
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("@patientPermissionService.canViewPatient(#patientId)")
    public ResponseEntity<List<VitalSignsResponse>> getHistory(@PathVariable UUID patientId) {
        auditService.logAction("VIEW_VITAL_SIGNS", "PATIENT", patientId.toString(), "User viewed vital signs history");
        return ResponseEntity.ok(vitalSignsService.getHistory(patientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<VitalSignsResponse> recordVitals(@PathVariable UUID patientId, @RequestBody VitalSignsResponse request) {
        auditService.logAction("RECORD_VITAL_SIGNS", "PATIENT", patientId.toString(), "User recorded new vital signs");
        return ResponseEntity.ok(vitalSignsService.recordVitals(patientId, request));
    }
}
