package com.healthcare.service;

import com.healthcare.dto.VitalSignsResponse;
import com.healthcare.entity.Patient;
import com.healthcare.entity.Visit;
import com.healthcare.entity.VitalSigns;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.VisitRepository;
import com.healthcare.repository.VitalSignsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VitalSignsService {
    private final VitalSignsRepository vitalSignsRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public VitalSignsService(VitalSignsRepository vitalSignsRepository, PatientRepository patientRepository, VisitRepository visitRepository) {
        this.vitalSignsRepository = vitalSignsRepository;
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    @Transactional(readOnly = true)
    public List<VitalSignsResponse> getHistory(UUID patientId) {
        return vitalSignsRepository.findByPatient_PatientIdOrderByRecordedAtDesc(patientId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VitalSignsResponse recordVitals(UUID patientId, VitalSignsResponse request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        
        Visit visit = null;
        if (request.getVisitId() != null) {
            visit = visitRepository.findById(request.getVisitId()).orElse(null);
        }

        VitalSigns vitals = VitalSigns.builder()
                .patient(patient)
                .visit(visit)
                .recordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : java.time.LocalDateTime.now())
                .bloodPressureSystolic(request.getBloodPressureSystolic())
                .bloodPressureDiastolic(request.getBloodPressureDiastolic())
                .heartRate(request.getHeartRate())
                .temperature(request.getTemperature())
                .weight(request.getWeight())
                .height(request.getHeight())
                .respiratoryRate(request.getRespiratoryRate())
                .oxygenSaturation(request.getOxygenSaturation())
                .build();

        return toResponse(vitalSignsRepository.save(vitals));
    }

    public VitalSignsResponse toResponse(VitalSigns v) {
        return VitalSignsResponse.builder()
                .vitalSignId(v.getVitalSignId())
                .patientId(v.getPatient().getPatientId())
                .visitId(v.getVisit() != null ? v.getVisit().getVisitId() : null)
                .recordedAt(v.getRecordedAt())
                .bloodPressureSystolic(v.getBloodPressureSystolic())
                .bloodPressureDiastolic(v.getBloodPressureDiastolic())
                .heartRate(v.getHeartRate())
                .temperature(v.getTemperature())
                .weight(v.getWeight())
                .height(v.getHeight())
                .bmi(v.getBmi())
                .respiratoryRate(v.getRespiratoryRate())
                .oxygenSaturation(v.getOxygenSaturation())
                .build();
    }
}
