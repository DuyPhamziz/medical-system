package com.healthcare.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSignsResponse {
    private UUID vitalSignId;
    private UUID patientId;
    private UUID visitId;
    private LocalDateTime recordedAt;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer heartRate;
    private Double temperature;
    private Double weight;
    private Double height;
    private Double bmi;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
}
