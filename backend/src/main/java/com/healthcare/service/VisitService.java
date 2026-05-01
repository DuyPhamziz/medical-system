package com.healthcare.service;

import com.healthcare.dto.VisitResponse;
import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import com.healthcare.entity.Visit;
import com.healthcare.entity.enums.VisitStatus;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.repository.VisitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VisitService {
    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public VisitService(VisitRepository visitRepository, PatientRepository patientRepository, UserRepository userRepository) {
        this.visitRepository = visitRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<VisitResponse> getVisitHistory(UUID patientId) {
        return visitRepository.findByPatient_PatientIdOrderByVisitDateDesc(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
                .visitDate(request.getVisitDate() != null ? request.getVisitDate() : java.time.LocalDateTime.now())
                .reasonForVisit(request.getReasonForVisit())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .notes(request.getNotes())
                .status(request.getStatus() != null ? VisitStatus.valueOf(request.getStatus()) : VisitStatus.SCHEDULED)
                .build();

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
