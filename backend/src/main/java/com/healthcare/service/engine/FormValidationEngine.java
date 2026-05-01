package com.healthcare.service.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.entity.FormQuestion;
import com.healthcare.entity.QuestionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class FormValidationEngine {
    private final ObjectMapper objectMapper;
    private final FormExpressionEvaluator expressionEvaluator;

    public List<String> validateAnswer(FormQuestion question, Object answerValue, Map<UUID, Object> allAnswers) {
        List<String> errors = new ArrayList<>();
        String configJson = question.getConfigJson();

        // 1. Config JSON Validations
        if (configJson != null && !configJson.isBlank()) {
            try {
                JsonNode config = objectMapper.readTree(configJson);
                JsonNode validations = config.get("validations");
                if (validations != null && validations.isArray()) {
                    for (JsonNode validation : validations) {
                        String error = evaluateValidation(validation, answerValue, allAnswers);
                        if (error != null) errors.add(error);
                    }
                }
            } catch (Exception e) {
                log.error("Validation parse error: {}", e.getMessage());
            }
        }

        // 2. Required Check
        boolean isEmpty = answerValue == null || answerValue.toString().isBlank();
        if (answerValue instanceof Collection) {
            isEmpty = ((Collection<?>) answerValue).isEmpty();
        }
        
        if (question.isRequired() && isEmpty) {
            errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Trường này là bắt buộc");
            return errors; // No need to check other constraints if empty and required
        }

        // If not required and empty, skip other constraints
        if (isEmpty) return errors;

        // 3. Numeric Constraints (NUMBER, SCALE, MULTIPLE_CHOICE count)
        if (question.getQuestionType() == QuestionType.NUMBER) {
            try {
                BigDecimal val = expressionEvaluator.toBigDecimal(answerValue);
                if (question.getMinValue() != null && val.compareTo(question.getMinValue()) < 0) {
                    errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Giá trị tối thiểu là " + question.getMinValue());
                }
                if (question.getMaxValue() != null && val.compareTo(question.getMaxValue()) > 0) {
                    errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Giá trị tối đa là " + question.getMaxValue());
                }
            } catch (Exception e) {
                errors.add("Giá trị không hợp lệ");
            }
        } else if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE && answerValue instanceof Collection) {
            int count = ((Collection<?>) answerValue).size();
            if (question.getMinLength() != null && count < question.getMinLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Vui lòng chọn ít nhất " + question.getMinLength() + " đáp án");
            }
            if (question.getMaxLength() != null && count > question.getMaxLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Chỉ được chọn tối đa " + question.getMaxLength() + " đáp án");
            }
        }

        // 4. String Length Constraints (TEXT)
        if (question.getQuestionType() == QuestionType.TEXT) {
            String strVal = answerValue.toString();
            if (question.getMinLength() != null && strVal.length() < question.getMinLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Tối thiểu " + question.getMinLength() + " ký tự");
            }
            if (question.getMaxLength() != null && strVal.length() > question.getMaxLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Tối đa " + question.getMaxLength() + " ký tự");
            }
        }

        // 5. Collection Size Constraints (FILE_UPLOAD)
        if (question.getQuestionType() == QuestionType.FILE_UPLOAD) {
            int count = 0;
            if (answerValue instanceof Collection) {
                count = ((Collection<?>) answerValue).size();
            } else if (answerValue != null && !answerValue.toString().isBlank() && !answerValue.toString().equals("[]")) {
                // Handle JSON string of files
                try {
                    JsonNode node = objectMapper.readTree(answerValue.toString());
                    if (node.isArray()) count = node.size();
                    else count = 1;
                } catch (Exception e) {
                    count = 1;
                }
            }

            if (question.getMinLength() != null && count < question.getMinLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Vui lòng tải lên ít nhất " + question.getMinLength() + " file");
            }
            if (question.getMaxLength() != null && count > question.getMaxLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Chỉ được phép tải lên tối đa " + question.getMaxLength() + " file");
            }
        }

        // 6. Time Series Constraints (TIME_SERIES)
        if (question.getQuestionType() == QuestionType.TIME_SERIES) {
            int count = 0;
            if (answerValue instanceof Collection) {
                count = ((Collection<?>) answerValue).size();
            } else if (answerValue != null && !answerValue.toString().isBlank()) {
                try {
                    JsonNode node = objectMapper.readTree(answerValue.toString());
                    if (node.isArray()) count = node.size();
                } catch (Exception e) {}
            }

            if (question.getMinLength() != null && count < question.getMinLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Vui lòng nhập ít nhất " + question.getMinLength() + " bản ghi");
            }
            if (question.getMaxLength() != null && count > question.getMaxLength()) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Chỉ được phép nhập tối đa " + question.getMaxLength() + " bản ghi");
            }
        }

        // 7. Pattern Constraints (TEXT)
        if (question.getQuestionType() == QuestionType.TEXT && question.getValidationPattern() != null && !question.getValidationPattern().isBlank()) {

            if (!answerValue.toString().matches(question.getValidationPattern())) {
                errors.add(question.getValidationMessage() != null ? question.getValidationMessage() : "Định dạng không hợp lệ");
            }
        }

        return errors;
    }

    private String evaluateValidation(JsonNode validation, Object value, Map<UUID, Object> allAnswers) {
        String type = validation.get("type") != null ? validation.get("type").asText() : "required";
        String message = validation.get("message") != null ? validation.get("message").asText() : "Lỗi xác thực";

        try {
            return switch (type) {
                case "min" -> {
                    BigDecimal min = new BigDecimal(validation.get("value").asText());
                    yield expressionEvaluator.toBigDecimal(value).compareTo(min) < 0 ? message : null;
                }
                case "max" -> {
                    BigDecimal max = new BigDecimal(validation.get("value").asText());
                    yield expressionEvaluator.toBigDecimal(value).compareTo(max) > 0 ? message : null;
                }
                case "pattern" -> {
                    String pattern = validation.get("value").asText();
                    yield !value.toString().matches(pattern) ? message : null;
                }
                case "custom" -> {
                    String formula = validation.get("formula") != null ? validation.get("formula").asText() : null;
                    if (formula != null) {
                        Object result = expressionEvaluator.evaluateFormula(formula, allAnswers, null);
                        if (!Boolean.TRUE.equals(result)) yield message;
                    }
                    yield null;
                }
                default -> null;
            };
        } catch (Exception e) { return null; }
    }
}
