package com.healthcare.service;

import com.healthcare.dto.PatientResponse;
import com.healthcare.entity.Patient;
import com.healthcare.entity.User;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> listAll() {
        return patientRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse update(UUID patientId, PatientResponse request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        
        patient.setFullName(request.getFullName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAddress(request.getAddress());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setNationalId(request.getNationalId());
        patient.setHealthInsuranceNumber(request.getHealthInsuranceNumber());
        patient.setOccupation(request.getOccupation());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        
        if (request.getStatus() != null) {
            patient.setStatus(com.healthcare.entity.enums.PatientStatus.valueOf(request.getStatus()));
        }

        return toResponse(patientRepository.save(patient));
    }

    private PatientResponse toResponse(Patient patient) {
        User user = patient.getUser();
        return PatientResponse.builder()
                .patientId(patient.getPatientId())
                .fullName(patient.getFullName())
                .phoneNumber(patient.getPhoneNumber())
                .address(patient.getAddress())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .nationalId(patient.getNationalId())
                .healthInsuranceNumber(patient.getHealthInsuranceNumber())
                .occupation(patient.getOccupation())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .status(patient.getStatus() != null ? patient.getStatus().name() : null)
                .userId(user != null ? user.getUserId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
