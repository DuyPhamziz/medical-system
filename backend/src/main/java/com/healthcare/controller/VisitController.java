package com.healthcare.controller;

import com.healthcare.dto.VisitResponse;
import com.healthcare.service.VisitService;
import com.healthcare.service.AuditService;
import com.healthcare.security.FormPermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/visits")
public class VisitController {
    private final VisitService visitService;
    private final AuditService auditService;
    private final FormPermissionService formPermissionService;

    public VisitController(VisitService visitService, AuditService auditService, FormPermissionService formPermissionService) {
        this.visitService = visitService;
        this.auditService = auditService;
        this.formPermissionService = formPermissionService;
    }

    @GetMapping
    @PreAuthorize("@patientPermissionService.canViewPatient(#patientId)")
    public ResponseEntity<List<VisitResponse>> getHistory(@PathVariable UUID patientId) {
        auditService.logAction("VIEW_VISIT_HISTORY", "PATIENT", patientId.toString(), "User viewed visit history");
        return ResponseEntity.ok(visitService.getVisitHistory(patientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<VisitResponse> createVisit(@PathVariable UUID patientId, @RequestBody VisitResponse request) {
        UUID doctorId = formPermissionService.getCurrentUser().getUserId();
        auditService.logAction("CREATE_VISIT", "PATIENT", patientId.toString(), "Doctor created a new visit encounter");
        return ResponseEntity.ok(visitService.createVisit(patientId, doctorId, request));
    }
}
