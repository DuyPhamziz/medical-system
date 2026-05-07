package com.healthcare.controller;

import com.healthcare.dto.CreatePrescriptionRequest;
import com.healthcare.dto.PrescriptionResponse;
import com.healthcare.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/{prescriptionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PrescriptionResponse> getPrescription(@PathVariable UUID prescriptionId) {
        return ResponseEntity.ok(prescriptionService.getPrescription(prescriptionId));
    }

    @GetMapping("/by-visit/{visitId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByVisit(@PathVariable UUID visitId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByVisit(visitId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(@RequestBody CreatePrescriptionRequest request) {
        return ResponseEntity.ok(prescriptionService.createPrescription(request));
    }

    @DeleteMapping("/{prescriptionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deletePrescription(@PathVariable UUID prescriptionId) {
        prescriptionService.deletePrescription(prescriptionId);
        return ResponseEntity.ok().build();
    }
}
