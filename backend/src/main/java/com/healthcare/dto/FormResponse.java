package com.healthcare.dto;

import com.healthcare.entity.AnswerSessionStatus;
import com.healthcare.entity.AnswerSource;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormResponse {
    private UUID formId;
    private String title;
    private String description;
    private boolean template;
    private boolean publicForm;
    private String visibility;  // FormVisibility: PUBLIC, DOCTOR_ONLY, PRIVATE
    private boolean paid;
    private BigDecimal price;
    private FormStatus status;
    private int version;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID createdById;
    private String createdByName;
    @Builder.Default
    private List<SectionResponse> sections = new ArrayList<>();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionResponse {
        private UUID sectionId;
        private String title;
        private String description;
        private int orderIndex;
        private boolean allowRepeat;
        private String repeatLabel;
        @Builder.Default
        private List<QuestionResponse> questions = new ArrayList<>();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private UUID questionId;
        private String content;
        private QuestionType questionType;
        private boolean required;
        private boolean allowRepeat;
        private int orderIndex;
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
        private UUID scaleId;
        private UUID parentQuestionId;
        private UUID parentOptionId;
        @Builder.Default
        private List<QuestionResponse> subQuestions = new ArrayList<>();
        @Builder.Default
        private List<OptionResponse> options = new ArrayList<>();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionResponse {
        private UUID optionId;
        private String content;
        private BigDecimal score;
        private int orderIndex;
        private String triggerLogic;
    }
}