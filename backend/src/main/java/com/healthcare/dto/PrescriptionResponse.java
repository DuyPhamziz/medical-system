package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {
    private UUID prescriptionId;
    private UUID visitId;
    private LocalDateTime createdAt;
    private String note;
    private List<PrescriptionItemResponse> items;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItemResponse {
        private UUID medicationId;
        private String medicationName;
        private String unit;
        private String dosage;
        private String frequency;
        private String duration;
    }
}
