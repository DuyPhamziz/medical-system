package com.healthcare.dto;

import com.healthcare.entity.AnswerSessionStatus;
import com.healthcare.entity.AnswerSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSessionResponse {
    private UUID sessionId;
    private UUID formId;
    private UUID patientId;
    private UUID visitId;
    private AnswerSessionStatus status;
    private AnswerSource source;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime lastSavedAt;
    private BigDecimal totalScore;
    private List<AnswerResponse> answers;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResponse {
        private UUID answerId;
        private UUID questionId;
        private UUID optionId;
        private int repeatIndex;
        private String valueText;
        private BigDecimal valueNumber;
        private java.time.LocalDate valueDate;
        private Boolean valueBoolean;
        private String valueJson;
    }
}