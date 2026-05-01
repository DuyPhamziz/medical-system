package com.healthcare.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitResponse {
    private UUID visitId;
    private UUID patientId;
    private UUID doctorId;
    private String doctorName;
    private LocalDateTime visitDate;
    private String reasonForVisit;
    private String diagnosis;
    private String treatmentPlan;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
}
