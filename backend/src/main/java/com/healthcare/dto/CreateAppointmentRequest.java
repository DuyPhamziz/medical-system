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
public class CreateAppointmentRequest {
    private UUID doctorId;
    private UUID patientId;
    private UUID roomId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reason;
}
