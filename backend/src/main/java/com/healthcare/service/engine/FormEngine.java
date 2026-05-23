package com.healthcare.service.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.entity.*;
import com.healthcare.dto.AnswerSubmissionRequest;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class FormEngine {
    private final ObjectMapper objectMapper;
    private final FormExpressionEvaluator expressionEvaluator;
    private final FormValidationEngine validationEngine;

    public boolean isVisible(FormQuestion question, Map<UUID, Object> currentAnswers) {
        String configJson = question.getConfigJson();
        if (configJson == null || configJson.isBlank()) return true;
        try {
            JsonNode config = objectMapper.readTree(configJson);
            JsonNode conditions = config.get("conditions");
            if (conditions == null || !conditions.isArray()) return true;
            for (JsonNode cond : conditions) {
                if (!evaluateCondition(cond, currentAnswers)) return false;
            }
            return true;
        } catch (Exception e) { return true; }
    }

    private boolean evaluateCondition(JsonNode condition, Map<UUID, Object> currentAnswers) {
        String type = condition.get("type") != null ? condition.get("type").asText() : "simple";
        return switch (type) {
            case "and" -> {
                for (JsonNode sub : condition.get("conditions")) if (!evaluateCondition(sub, currentAnswers)) yield false;
                yield true;
            }
            case "or" -> {
                for (JsonNode sub : condition.get("conditions")) if (evaluateCondition(sub, currentAnswers)) yield true;
                yield false;
            }
            default -> {
                String srcId = condition.get("sourceQuestionId") != null ? condition.get("sourceQuestionId").asText() : null;
                if (srcId == null) yield true;
                Object actual = currentAnswers.get(UUID.fromString(srcId));
                Object expected = expressionEvaluator.resolveArgument(condition.get("value").toString(), currentAnswers);
                yield expressionEvaluator.applyOperator(actual, expected, condition.get("operator").asText("equals"));
            }
        };
    }

    public Map<String, Object> computeFields(Form form, Map<UUID, Object> currentAnswers) {
        Map<String, Object> computed = new HashMap<>();
        for (FormSection section : form.getSections()) {
            for (FormQuestion q : section.getQuestions()) {
                try {
                    JsonNode config = objectMapper.readTree(q.getConfigJson());
                    if (config.has("formula")) {
                        Object val = expressionEvaluator.evaluateFormula(config.get("formula").asText(), currentAnswers, form);
                        if (val != null) {
                            String name = config.has("fieldName") ? config.get("fieldName").asText() : "computed_" + q.getQuestionId();
                            computed.put(name, val);
                            currentAnswers.put(q.getQuestionId(), val);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error computing field for question {}: {}", q.getQuestionId(), e.getMessage());
                }
            }
        }
        return computed;
    }

    public FormState evaluateFormState(Form form, Map<UUID, Object> answers) {
        FormState state = new FormState();
        for (FormSection section : form.getSections()) {
            FormState.SectionState sState = FormState.SectionState.builder().sectionId(section.getSectionId()).title(section.getTitle()).build();
            for (FormQuestion q : section.getQuestions()) {
                boolean visible = isVisible(q, answers);
                sState.getQuestions().add(FormState.QuestionState.builder()
                        .questionId(q.getQuestionId()).content(q.getContent()).visible(visible)
                        .effectiveRequired(visible && q.isRequired()).computedValue(answers.get(q.getQuestionId())).build());
            }
            sState.setVisible(sState.getQuestions().stream().anyMatch(FormState.QuestionState::isVisible));
            state.getSections().add(sState);
        }
        state.setComputedValues(computeFields(form, answers));
        return state;
    }

    public PreparedAnswers prepareAnswers(Form form, List<AnswerSubmissionRequest.AnswerItem> answers) {
        Map<UUID, Object> currentAnswers = new HashMap<>();
        for (var item : answers) currentAnswers.put(item.getQuestionId(), extractAnswerValue(item));
        
        PreparedAnswers prepared = new PreparedAnswers();
        prepared.setComputedValues(computeFields(form, currentAnswers));
        
        List<String> errors = new ArrayList<>();
        for (var item : answers) {
            FormQuestion q = findQuestionById(form, item.getQuestionId());
            if (q != null) errors.addAll(validationEngine.validateAnswer(q, extractAnswerValue(item), currentAnswers));
        }
        prepared.setValidationErrors(errors);
        return prepared;
    }

    private Object extractAnswerValue(AnswerSubmissionRequest.AnswerItem item) {
        if (item.getValueJson() != null && !item.getValueJson().isBlank()) {
            try { return objectMapper.readTree(item.getValueJson()); } catch (Exception e) { return item.getValueJson(); }
        }
        if (item.getValueText() != null) return item.getValueText();
        if (item.getValueNumber() != null) return item.getValueNumber();
        return null;
    }

    private FormQuestion findQuestionById(Form form, UUID id) {
        return form.getSections().stream().flatMap(s -> s.getQuestions().stream()).filter(q -> q.getQuestionId().equals(id)).findFirst().orElse(null);
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FormState {
        @Builder.Default
        private List<SectionState> sections = new ArrayList<>();
        @Builder.Default
        private Map<String, Object> computedValues = new HashMap<>();
        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class SectionState {
            private UUID sectionId; private String title; 
            @Builder.Default
            private boolean visible = true;
            @Builder.Default
            private List<QuestionState> questions = new ArrayList<>();
        }
        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class QuestionState {
            private UUID questionId; private String content; 
            @Builder.Default
            private boolean visible = true;
            private boolean effectiveRequired; private Object computedValue;
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PreparedAnswers {
        private Map<String, Object> computedValues; private List<String> validationErrors;
        public boolean isValid() { return validationErrors == null || validationErrors.isEmpty(); }
    }
}
