package com.healthcare.service;

import com.healthcare.dto.UpdateVisitRequest;
import com.healthcare.dto.VisitResponse;
import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import com.healthcare.entity.Visit;
import com.healthcare.entity.enums.VisitStatus;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VisitService {
    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<VisitResponse> getVisitHistory(UUID patientId) {
        return visitRepository.findByPatient_PatientIdOrderByVisitDateDesc(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VisitResponse getVisit(UUID visitId) {
        return visitRepository.findById(visitId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
    }

    @Transactional(readOnly = true)
    public List<VisitResponse> getDoctorVisits(UUID doctorId, VisitStatus status) {
        if (status != null) {
            return visitRepository.findByDoctor_UserIdAndStatusOrderByVisitDateDesc(doctorId, status)
                    .stream().map(this::toResponse).toList();
        }
        return visitRepository.findByDoctor_UserIdOrderByVisitDateDesc(doctorId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public VisitResponse createVisit(UUID patientId, UUID doctorId, VisitResponse request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        Visit visit = Visit.builder()
                .patient(patient)
                .doctor(doctor)
                .visitDate(request.getVisitDate() != null ? request.getVisitDate() : LocalDateTime.now())
                .reasonForVisit(request.getReasonForVisit())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .notes(request.getNotes())
                .status(request.getStatus() != null ? VisitStatus.valueOf(request.getStatus()) : VisitStatus.IN_PROGRESS)
                .build();

        return toResponse(visitRepository.save(visit));
    }

    @Transactional
    public VisitResponse updateVisit(UUID visitId, UpdateVisitRequest request) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        if (request.getDiagnosis() != null) visit.setDiagnosis(request.getDiagnosis());
        if (request.getTreatmentPlan() != null) visit.setTreatmentPlan(request.getTreatmentPlan());
        if (request.getNotes() != null) visit.setNotes(request.getNotes());
        if (request.getReasonForVisit() != null) visit.setReasonForVisit(request.getReasonForVisit());
        if (request.getStatus() != null) visit.setStatus(VisitStatus.valueOf(request.getStatus()));

        return toResponse(visitRepository.save(visit));
    }

    @Transactional
    public VisitResponse updateStatus(UUID visitId, String status) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
        visit.setStatus(VisitStatus.valueOf(status));
        return toResponse(visitRepository.save(visit));
    }

    public VisitResponse toResponse(Visit visit) {
        String doctorName = visit.getDoctor().getFullName();
        if (doctorName == null || doctorName.isBlank()) {
            doctorName = visit.getDoctor().getUsername();
        }
        return VisitResponse.builder()
                .visitId(visit.getVisitId())
                .patientId(visit.getPatient().getPatientId())
                .doctorId(visit.getDoctor().getUserId())
                .doctorName(doctorName)
                .visitDate(visit.getVisitDate())
                .reasonForVisit(visit.getReasonForVisit())
                .diagnosis(visit.getDiagnosis())
                .treatmentPlan(visit.getTreatmentPlan())
                .notes(visit.getNotes())
                .status(visit.getStatus().name())
                .createdAt(visit.getCreatedAt())
                .build();
    }
}
