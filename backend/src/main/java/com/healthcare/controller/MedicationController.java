package com.healthcare.controller;

import com.healthcare.dto.CreateMedicationRequest;
import com.healthcare.entity.Medication;
import com.healthcare.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Medication>> getAllMedications() {
        return ResponseEntity.ok(medicationService.getAllMedications());
    }

    @GetMapping("/{medicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Medication> getMedication(@PathVariable UUID medicationId) {
        return ResponseEntity.ok(medicationService.getMedication(medicationId));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Medication>> searchMedications(@RequestParam String name) {
        return ResponseEntity.ok(medicationService.searchMedications(name));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Medication> createMedication(@RequestBody CreateMedicationRequest request) {
        return ResponseEntity.ok(medicationService.createMedication(request));
    }

    @PutMapping("/{medicationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Medication> updateMedication(
            @PathVariable UUID medicationId,
            @RequestBody CreateMedicationRequest request) {
        return ResponseEntity.ok(medicationService.updateMedication(medicationId, request));
    }

    @DeleteMapping("/{medicationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deleteMedication(@PathVariable UUID medicationId) {
        medicationService.deleteMedication(medicationId);
        return ResponseEntity.ok().build();
    }
}
