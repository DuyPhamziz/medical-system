package com.healthcare.service;

import com.healthcare.dto.PatientFormResponse;
import com.healthcare.dto.PatientResponse;
import com.healthcare.dto.PatientUpdateRequest;
import com.healthcare.entity.AnswerSession;
import com.healthcare.entity.Form;
import com.healthcare.entity.Patient;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.AnswerSessionRepository;
import com.healthcare.repository.FormRepository;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final AnswerSessionRepository answerSessionRepository;
    private final FormRepository formRepository;

    public PatientService(
            PatientRepository patientRepository,
            AnswerSessionRepository answerSessionRepository,
            FormRepository formRepository
    ) {
        this.patientRepository = patientRepository;
        this.answerSessionRepository = answerSessionRepository;
        this.formRepository = formRepository;
    }

    public PatientResponse getPatientById(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        enforceViewPermission(patient);

        return mapToResponse(patient);
    }

    public PatientResponse updatePatient(UUID patientId, PatientUpdateRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // Patient can update self, ADMIN and DOCTOR can update any patient
        Role role = getCurrentRole();
        boolean canUpdate = role == Role.ADMIN || role == Role.DOCTOR ||
                (role == Role.PATIENT && isCurrentUser(patient));

        if (!canUpdate) {
            throw new AccessDeniedException("No permission to update this patient");
        }

        patient.setFullName(request.getFullName());
        patientRepository.save(patient);

        return mapToResponse(patient);
    }

    public List<PatientFormResponse> getPatientForms(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        enforceViewPermission(patient);

        List<AnswerSession> sessions = answerSessionRepository.findByPatient_PatientIdOrderByLastSavedAtDesc(patientId);

        return sessions.stream()
                .map(this::mapToFormResponse)
                .collect(Collectors.toList());
    }

    private void enforceViewPermission(Patient patient) {
        Role role = getCurrentRole();
        if (role == null) {
            throw new AccessDeniedException("Unauthenticated");
        }

        switch (role) {
            case ADMIN, DOCTOR, STAFF -> {
                // These roles can view patient records
            }
            case PATIENT -> {
                if (!isCurrentUser(patient)) {
                    throw new AccessDeniedException("Patients can only view their own records");
                }
            }
            default -> throw new AccessDeniedException("No permission to view patient");
        }
    }

    private boolean isCurrentUser(Patient patient) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return false;
        User user = patient.getUser();
        return user != null && auth.getName().equals(user.getEmail());
    }

    private Role getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.startsWith("ROLE_")) {
                try {
                    return Role.valueOf(role.substring(5));
                } catch (IllegalArgumentException e) {
                    // continue
                }
            }
        }
        return null;
    }

    private PatientResponse mapToResponse(Patient patient) {
        PatientResponse.PatientResponseBuilder builder = PatientResponse.builder()
                .patientId(patient.getPatientId())
                .fullName(patient.getFullName())
                .createdAt(patient.getCreatedAt())
                .userId(patient.getUser() != null ? patient.getUser().getUserId() : null);

        if (patient.getUser() != null) {
            builder.email(patient.getUser().getEmail());
            builder.username(patient.getUser().getUsername());
        }

        return builder.build();
    }

    private PatientFormResponse mapToFormResponse(AnswerSession session) {
        Form form = session.getForm();
        int answerCount = session.getAnswers() != null ? session.getAnswers().size() : 0;

        return PatientFormResponse.builder()
                .sessionId(session.getSessionId())
                .formId(form.getFormId())
                .formTitle(form.getTitle())
                .formStatus(form.getStatus())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .submittedAt(session.getSubmittedAt())
                .totalScore(session.getTotalScore() != null ? session.getTotalScore() : BigDecimal.ZERO)
                .answerCount(answerCount)
                .build();
    }
}
