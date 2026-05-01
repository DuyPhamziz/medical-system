package com.healthcare.controller;

import com.healthcare.dto.PatientDashboardDTO;
import com.healthcare.service.PatientDashboardService;
import com.healthcare.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{id}/dashboard")
public class PatientDashboardController {
    private final PatientDashboardService dashboardService;
    private final AuditService auditService;

    public PatientDashboardController(PatientDashboardService dashboardService, AuditService auditService) {
        this.dashboardService = dashboardService;
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("@patientPermissionService.canViewPatient(#id)")
    public ResponseEntity<PatientDashboardDTO> getDashboard(@PathVariable UUID id) {
        auditService.logAction("VIEW_PATIENT_DASHBOARD", "PATIENT", id.toString(), "User viewed patient dashboard");
        return ResponseEntity.ok(dashboardService.getDashboardData(id));
    }
}
