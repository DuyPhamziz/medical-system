package com.healthcare.controller;

import com.healthcare.dto.AppointmentResponse;
import com.healthcare.dto.CreateAppointmentRequest;
import com.healthcare.security.SecurityUtils;
import com.healthcare.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SecurityUtils securityUtils;

    @GetMapping("/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments() {
        UUID userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(userId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(@PathVariable UUID patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'STAFF')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDateRange(
            @RequestParam String from,
            @RequestParam String to) {
        LocalDateTime fromDt = LocalDateTime.parse(from, java.time.format.DateTimeFormatter.ISO_DATE_TIME);
        LocalDateTime toDt = LocalDateTime.parse(to, java.time.format.DateTimeFormatter.ISO_DATE_TIME);
        return ResponseEntity.ok(appointmentService.getAppointmentsByDateRange(fromDt, toDt));
    }

    @GetMapping("/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppointmentResponse> getAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointment(appointmentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'STAFF')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @PostMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'STAFF', 'PATIENT')")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID appointmentId) {
        UUID userId = securityUtils.getCurrentUserId();
        boolean isAdmin = securityUtils.hasRole("ADMIN");
        appointmentService.cancelAppointment(appointmentId, userId, isAdmin);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/slots")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LocalDateTime>> getAvailableSlots(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }
}
