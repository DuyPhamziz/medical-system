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
public class AppointmentResponse {
    private UUID appointmentId;
    private UUID doctorId;
    private String doctorName;
    private UUID patientId;
    private String patientName;
    private UUID roomId;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reason;
    private String status;
}
