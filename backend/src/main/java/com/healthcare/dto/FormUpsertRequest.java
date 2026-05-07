package com.healthcare.dto;

import com.healthcare.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormUpsertRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    @Builder.Default
    private boolean template = false;

    @Builder.Default
    private boolean publicForm = false;

    @Builder.Default
    private String visibility = "DOCTOR_ONLY";  // FormVisibility enum: PUBLIC, DOCTOR_ONLY, PRIVATE

    @Builder.Default
    private boolean paid = false;

    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Valid
    @Builder.Default
    private List<SectionRequest> sections = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionRequest {
        private String sectionId; // Optional UUID

        @NotBlank
        @Size(max = 255)
        private String title;

        private String description;

        @Builder.Default
        private boolean allowRepeat = false;

        private String repeatLabel;

        @Valid
        @Builder.Default
        private List<QuestionRequest> questions = new ArrayList<>();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionRequest {
        private String questionId; // Optional UUID

        @NotBlank
        private String content;

        @NotNull
        private QuestionType questionType;

        @Builder.Default
        private boolean required = false;

        @Builder.Default
        private boolean allowRepeat = false;

        private Integer orderIndex;
        private BigDecimal minValue;
        private BigDecimal maxValue;
        private Integer minLength;
        private Integer maxLength;
        private String validationPattern;
        private String validationMessage;
        private String placeholder;
        private String helperText;
        private Integer scaleMin;
        private Integer scaleMax;
        private String triggerLogic;
        private String configJson;
        private String aiConfigJson;
        private String dataClassification;
        private boolean isPii;
        private String parentQuestionId;
        private String parentOptionId;

        @Valid
        @Builder.Default
        private List<QuestionRequest> subQuestions = new ArrayList<>();

        @Valid
        @Builder.Default
        private List<OptionRequest> options = new ArrayList<>();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionRequest {
        private String optionId; // Optional UUID

        @NotBlank
        private String content;

        @Builder.Default
        private BigDecimal score = BigDecimal.ZERO;

        private Integer orderIndex;
        private String triggerLogic;
    }
}