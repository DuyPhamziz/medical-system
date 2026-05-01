package com.healthcare.service;

import com.healthcare.dto.PatientDashboardDTO;
import com.healthcare.entity.Patient;
import com.healthcare.repository.AnswerSessionRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientDashboardService {
    private final PatientRepository patientRepository;
    private final PatientService patientService;
    private final VisitService visitService;
    private final VitalSignsService vitalSignsService;
    private final AnswerSessionRepository answerSessionRepository;
    private final FormMapper formMapper;

    public PatientDashboardService(
            PatientRepository patientRepository,
            PatientService patientService,
            VisitService visitService,
            VitalSignsService vitalSignsService,
            AnswerSessionRepository answerSessionRepository,
            FormMapper formMapper
    ) {
        this.patientRepository = patientRepository;
        this.patientService = patientService;
        this.visitService = visitService;
        this.vitalSignsService = vitalSignsService;
        this.answerSessionRepository = answerSessionRepository;
        this.formMapper = formMapper;
    }

    @Transactional(readOnly = true)
    public PatientDashboardDTO getDashboardData(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        return PatientDashboardDTO.builder()
                .patientInfo(patientService.getById(patientId))
                .recentVisits(visitService.getVisitHistory(patientId))
                .vitalSignsHistory(vitalSignsService.getHistory(patientId))
                .recentForms(answerSessionRepository.findByPatient_PatientIdOrderByLastSavedAtDesc(patientId).stream()
                        .map(formMapper::toPatientFormResponse)
                        .collect(Collectors.toList()))
                .build();
    }
}
