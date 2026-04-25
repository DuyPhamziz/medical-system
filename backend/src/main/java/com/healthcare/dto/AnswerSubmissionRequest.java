package com.healthcare.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSubmissionRequest {
    private UUID sessionId;
    private UUID patientId;
    private UUID visitId;

    @Valid
    @NotNull
    @Builder.Default
    private List<AnswerItem> answers = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerItem {
        @NotNull
        private UUID questionId;

        private UUID optionId;
        private Integer repeatIndex;
        private String valueText;
        private BigDecimal valueNumber;
        private LocalDate valueDate;
        private Boolean valueBoolean;
        private String valueJson;
    }
}