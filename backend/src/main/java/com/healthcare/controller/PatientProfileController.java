package com.healthcare.controller;

import com.healthcare.dto.PatientProfileRequest;
import com.healthcare.dto.PatientProfileResponse;
import com.healthcare.security.SecurityUtils;
import com.healthcare.service.PatientProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patient-profiles")
public class PatientProfileController {

    private final PatientProfileService patientProfileService;
    private final SecurityUtils securityUtils;

    public PatientProfileController(PatientProfileService patientProfileService, SecurityUtils securityUtils) {
        this.patientProfileService = patientProfileService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PatientProfileResponse>> listForDoctor() {
        return ResponseEntity.ok(patientProfileService.listAll());
    }

    @GetMapping("/{maBenhNhan}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientProfileResponse> getById(@PathVariable UUID maBenhNhan) {
        return ResponseEntity.ok(patientProfileService.getById(maBenhNhan));
    }

    @PutMapping("/{maBenhNhan}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientProfileResponse> upsertByDoctor(
            @PathVariable UUID maBenhNhan,
            @Valid @RequestBody PatientProfileRequest request
    ) {
        return ResponseEntity.ok(patientProfileService.upsertByDoctor(maBenhNhan, request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfileResponse> getMine() {
        return ResponseEntity.ok(patientProfileService.getMyProfile(currentUserEmail()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfileResponse> upsertMine(@Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(patientProfileService.upsertMyProfile(currentUserEmail(), request));
    }

    private String currentUserEmail() {
        String email = securityUtils.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Khong xac dinh duoc nguoi dung hien tai");
        }
        return email;
    }
}
