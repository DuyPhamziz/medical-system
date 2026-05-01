package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private UUID patientId;
    private String fullName;
    private String email;
    private String username;
    private String phoneNumber;
    private String address;
    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String nationalId;
    private String healthInsuranceNumber;
    private String occupation;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String status;
    private LocalDateTime createdAt;
    private UUID userId;
}
