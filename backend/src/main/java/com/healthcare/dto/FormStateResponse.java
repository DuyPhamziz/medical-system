package com.healthcare.dto;

import com.healthcare.entity.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for form state evaluation response
 * Returns the dynamic form state with computed visibility, required status, and computed values
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormStateResponse {
    private UUID formId;
    @Builder.Default
    private List<FormStateResponse.SectionState> sections = new ArrayList<>();
    private Map<String, Object> computedValues;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionState {
        private UUID sectionId;
        private String title;
        private boolean allowRepeat;
        private boolean visible;
        @Builder.Default
        private List<QuestionState> questions = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionState {
        private UUID questionId;
        private String content;
        private QuestionType questionType;
        private boolean required;
        private boolean allowRepeat;
        private boolean visible;
        private boolean effectiveRequired;
        private Object computedValue;
        @Builder.Default
        private List<UUID> visibleOptionIds = new ArrayList<>();
    }
}
