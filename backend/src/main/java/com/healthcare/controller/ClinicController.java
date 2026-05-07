package com.healthcare.controller;

import com.healthcare.dto.*;
import com.healthcare.service.ClinicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final ClinicService clinicService;

    // ============================================================
    // Clinic endpoints
    // ============================================================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClinicResponse>> getAllClinics() {
        var clinics = clinicService.getAllClinics();
        var responses = clinics.stream()
                .map(ClinicResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{clinicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClinicResponse> getClinic(@PathVariable UUID clinicId) {
        var clinic = clinicService.getClinic(clinicId);
        return ResponseEntity.ok(ClinicResponse.fromEntity(clinic));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicResponse> createClinic(@RequestBody CreateClinicRequest request) {
        var clinic = clinicService.createClinic(
                request.getName(),
                request.getAddress(),
                request.getPhone(),
                request.getOrgId()
        );
        return ResponseEntity.ok(ClinicResponse.fromEntity(clinic));
    }

    @PutMapping("/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicResponse> updateClinic(
            @PathVariable UUID clinicId,
            @RequestBody CreateClinicRequest request) {
        var clinic = clinicService.updateClinic(
                clinicId, request.getName(), request.getAddress(), request.getPhone());
        return ResponseEntity.ok(ClinicResponse.fromEntity(clinic));
    }

    @DeleteMapping("/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClinic(@PathVariable UUID clinicId) {
        clinicService.deleteClinic(clinicId);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // Room endpoints (nested under clinic)
    // ============================================================

    @GetMapping("/{clinicId}/rooms")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RoomResponse>> getRoomsByClinic(@PathVariable UUID clinicId) {
        var rooms = clinicService.getRoomsByClinicId(clinicId);
        var responses = rooms.stream()
                .map(RoomResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{clinicId}/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(
            @PathVariable UUID clinicId,
            @RequestBody CreateRoomRequest request) {
        var room = clinicService.createRoom(clinicId, request.getName(), request.getType());
        return ResponseEntity.ok(RoomResponse.fromEntity(room));
    }
}
