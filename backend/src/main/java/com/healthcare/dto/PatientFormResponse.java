package com.healthcare.dto;

import com.healthcare.entity.AnswerSessionStatus;
import com.healthcare.entity.FormStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientFormResponse {
    private UUID sessionId;
    private UUID formId;
    private String formTitle;
    private FormStatus formStatus;
    private AnswerSessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private BigDecimal totalScore;
    private int answerCount;
}
