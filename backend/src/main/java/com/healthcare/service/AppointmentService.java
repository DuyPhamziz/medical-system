package com.healthcare.service;

import com.healthcare.dto.AppointmentResponse;
import com.healthcare.dto.CreateAppointmentRequest;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    private static final int SLOT_DURATION_MINUTES = 30;
    private static final LocalTime WORK_START = LocalTime.of(7, 0);
    private static final LocalTime WORK_END = LocalTime.of(17, 0);

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(UUID doctorId) {
        return appointmentRepository.findByDoctor_UserIdOrderByStartTimeAsc(doctorId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(UUID patientId) {
        return appointmentRepository.findByPatient_PatientIdOrderByStartTimeDesc(patientId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDateRange(LocalDateTime from, LocalDateTime to) {
        return appointmentRepository.findByDateRange(from, to)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));
    }

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        boolean hasOverlap = appointmentRepository.existsOverlappingAppointment(
                request.getDoctorId(), request.getStartTime(), request.getEndTime());
        if (hasOverlap) {
            throw new IllegalStateException("Bác sĩ đã có lịch hẹn trong khung giờ này");
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .reason(request.getReason())
                .status("SCHEDULED")
                .build();

        var saved = appointmentRepository.save(appointment);
        log.info("Created appointment: {} for patient {} with doctor {} at {}",
                saved.getAppointmentId(), request.getPatientId(), request.getDoctorId(), request.getStartTime());
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateStatus(UUID appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        appointment.setStatus(status);
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public void cancelAppointment(UUID appointmentId) {
        updateStatus(appointmentId, "CANCELLED");
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> getAvailableSlots(UUID doctorId, LocalDate date) {
        LocalDateTime dayStart = date.atTime(WORK_START);
        LocalDateTime dayEnd = date.atTime(WORK_END);

        var existingAppointments = appointmentRepository
                .findByDoctorAndDateRange(doctorId, dayStart, dayEnd);

        List<LocalDateTime> availableSlots = new ArrayList<>();
        LocalDateTime slotStart = dayStart;

        while (slotStart.plusMinutes(SLOT_DURATION_MINUTES).isBefore(dayEnd)
                || slotStart.plusMinutes(SLOT_DURATION_MINUTES).equals(dayEnd)) {
            LocalDateTime slotEnd = slotStart.plusMinutes(SLOT_DURATION_MINUTES);
            final LocalDateTime currentSlotStart = slotStart;
            boolean isBooked = existingAppointments.stream().anyMatch(a ->
                    !"CANCELLED".equals(a.getStatus()) &&
                    a.getStartTime().isBefore(slotEnd) &&
                    (a.getEndTime() == null || a.getEndTime().isAfter(currentSlotStart)));

            if (!isBooked) {
                availableSlots.add(slotStart);
            }
            slotStart = slotEnd;
        }

        return availableSlots;
    }

    private AppointmentResponse toResponse(Appointment app) {
        return AppointmentResponse.builder()
                .appointmentId(app.getAppointmentId())
                .doctorId(app.getDoctor() != null ? app.getDoctor().getUserId() : null)
                .doctorName(app.getDoctor() != null ? app.getDoctor().getFullName() : null)
                .patientId(app.getPatient() != null ? app.getPatient().getPatientId() : null)
                .patientName(app.getPatient() != null ? app.getPatient().getFullName() : null)
                .startTime(app.getStartTime())
                .endTime(app.getEndTime())
                .reason(app.getReason())
                .status(app.getStatus())
                .build();
    }
}
