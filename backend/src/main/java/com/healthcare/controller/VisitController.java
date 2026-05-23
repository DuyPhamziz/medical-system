package com.healthcare.controller;

import com.healthcare.dto.UpdateVisitRequest;
import com.healthcare.dto.VisitResponse;
import com.healthcare.entity.enums.VisitStatus;
import com.healthcare.security.SecurityUtils;
import com.healthcare.service.AuditService;
import com.healthcare.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class VisitController {
    private final VisitService visitService;
    private final AuditService auditService;
    private final SecurityUtils securityUtils;

    // ============================================================
    // Patient visit history & creation (existing routes)
    // ============================================================

    @GetMapping("/api/patients/{patientId}/visits")
    @PreAuthorize("@patientPermissionService.canViewPatient(#patientId)")
    public ResponseEntity<List<VisitResponse>> getHistory(@PathVariable UUID patientId) {
        auditService.logAction("VIEW_VISIT_HISTORY", "PATIENT", patientId.toString(), "User viewed visit history");
        return ResponseEntity.ok(visitService.getVisitHistory(patientId));
    }

    @PostMapping("/api/patients/{patientId}/visits")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<VisitResponse> createVisit(@PathVariable UUID patientId, @RequestBody VisitResponse request) {
        UUID doctorId = securityUtils.getCurrentUserId();
        auditService.logAction("CREATE_VISIT", "PATIENT", patientId.toString(), "Doctor created a new visit encounter");
        return ResponseEntity.ok(visitService.createVisit(patientId, doctorId, request));
    }

    // ============================================================
    // Visit detail & update
    // ============================================================

    @GetMapping("/api/visits/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'STAFF', 'PATIENT')")
    public ResponseEntity<VisitResponse> getVisit(@PathVariable UUID visitId) {
        VisitResponse visit = visitService.getVisit(visitId);
        // Verify access: patient only their own visit
        if (securityUtils.hasRole("PATIENT")
                && !securityUtils.hasAnyRole("ADMIN", "DOCTOR", "STAFF")) {
            UUID currentUserId = securityUtils.getCurrentUserId();
            if (visit.getPatientId() != null && !visit.getPatientId().equals(currentUserId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied to this visit");
            }
        }
        return ResponseEntity.ok(visit);
    }

    @PutMapping("/api/visits/{visitId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<VisitResponse> updateVisit(
            @PathVariable UUID visitId,
            @RequestBody UpdateVisitRequest request) {
        auditService.logAction("UPDATE_VISIT", "VISIT", visitId.toString(), "Doctor updated visit");
        return ResponseEntity.ok(visitService.updateVisit(visitId, request));
    }

    @PostMapping("/api/visits/{visitId}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<VisitResponse> updateVisitStatus(
            @PathVariable UUID visitId,
            @RequestBody String status) {
        return ResponseEntity.ok(visitService.updateStatus(visitId, status));
    }

    // ============================================================
    // Doctor visits
    // ============================================================

    @GetMapping("/api/visits/my")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<List<VisitResponse>> getMyVisits(
            @RequestParam(required = false) String status) {
        UUID doctorId = securityUtils.getCurrentUserId();
        VisitStatus visitStatus = status != null ? VisitStatus.valueOf(status) : null;
        return ResponseEntity.ok(visitService.getDoctorVisits(doctorId, visitStatus));
    }
}
