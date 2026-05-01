package com.healthcare.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.entity.FormAnswer;
import com.healthcare.entity.FormQuestion;
import com.healthcare.entity.FormQuestionOption;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

/**
 * Service for SCORED question type
 * Interprets total score from selected options and maps to severity categories.
 *
 * configJson structure:
 * {
 *   "categories": [
 *     {"min": 0, "max": 4, "label": "None", "severity": "NORMAL", "color": "green"},
 *     {"min": 5, "max": 9, "label": "Mild", "severity": "MILD", "color": "yellow"},
 *     {"min": 10, "max": 14, "label": "Moderate", "severity": "MODERATE", "color": "orange"},
 *     {"min": 15, "max": 27, "label": "Severe", "severity": "SEVERE", "color": "red"}
 *   ],
 *   "aggregation": "SUM"
 * }
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScoredQuestionService {

    private final ObjectMapper objectMapper;

    /**
     * Calculate total score for a SCORED question from its answer.
     * Supports SUM aggregation of selected option scores.
     */
    public ScoredResult calculateScore(FormQuestion question, FormAnswer answer) {
        if (question.getQuestionType() != com.healthcare.entity.QuestionType.SCORED) {
            return ScoredResult.empty();
        }

        BigDecimal totalScore = BigDecimal.ZERO;
        List<String> selectedLabels = new ArrayList<>();

        // Sum scores from selected options
        if (answer.getOption() != null) {
            BigDecimal optScore = answer.getOption().getScore();
            if (optScore != null) {
                totalScore = totalScore.add(optScore);
                selectedLabels.add(answer.getOption().getContent());
            }
        }

        // Parse valueJson for multiple selected options (checkbox-style SCORED)
        if (answer.getValueJson() != null && !answer.getValueJson().isBlank()) {
            try {
                List<Map<String, Object>> selections = objectMapper.readValue(
                    answer.getValueJson(), new TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> sel : selections) {
                    Object scoreVal = sel.get("score");
                    if (scoreVal instanceof Number) {
                        totalScore = totalScore.add(BigDecimal.valueOf(((Number) scoreVal).doubleValue()));
                    }
                    if (sel.containsKey("label")) {
                        selectedLabels.add(String.valueOf(sel.get("label")));
                    }
                }
            } catch (Exception e) {
                log.warn("Could not parse SCORED valueJson: {}", e.getMessage());
            }
        }

        // Find matching category
        ScoreCategory category = findCategory(question, totalScore);

        return ScoredResult.builder()
                .totalScore(totalScore)
                .category(category)
                .selectedLabels(selectedLabels)
                .build();
    }

    /**
     * Calculate score directly from answer values (used during form submission).
     */
    public ScoredResult calculateFromValues(FormQuestion question, Object answerValue) {
        if (question.getQuestionType() != com.healthcare.entity.QuestionType.SCORED) {
            return ScoredResult.empty();
        }

        BigDecimal totalScore = BigDecimal.ZERO;

        if (answerValue instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) answerValue;
            Object score = map.get("score");
            if (score instanceof Number) {
                totalScore = BigDecimal.valueOf(((Number) score).doubleValue());
            }
            // Check for optionId to look up score
            Object optionId = map.get("optionId");
            if (optionId != null && question.getOptions() != null) {
                String oidStr = String.valueOf(optionId);
                Optional<FormQuestionOption> matched = question.getOptions().stream()
                    .filter(o -> o.getOptionId() != null && o.getOptionId().toString().equals(oidStr))
                    .findFirst();
                if (matched.isPresent() && matched.get().getScore() != null) {
                    totalScore = matched.get().getScore();
                }
            }
        }

        ScoreCategory category = findCategory(question, totalScore);
        return ScoredResult.builder().totalScore(totalScore).category(category).build();
    }

    /**
     * Find the matching score category for a given total score.
     */
    private ScoreCategory findCategory(FormQuestion question, BigDecimal totalScore) {
        List<ScoreCategory> categories = parseCategories(question.getConfigJson());
        double score = totalScore != null ? totalScore.doubleValue() : 0.0;

        for (ScoreCategory cat : categories) {
            if (score >= cat.getMin() && score <= cat.getMax()) {
                return cat;
            }
        }
        // Fallback: return last category or default
        if (!categories.isEmpty()) {
            return categories.get(categories.size() - 1);
        }
        return ScoreCategory.builder()
                .min(0).max(999).label("Unknown")
                .severity("UNKNOWN").color("gray").build();
    }

    /**
     * Parse score categories from configJson.
     */
    private List<ScoreCategory> parseCategories(String configJson) {
        if (configJson == null || configJson.isBlank()) return List.of();
        try {
            var root = objectMapper.readTree(configJson);
            var catsNode = root.get("categories");
            if (catsNode == null || !catsNode.isArray()) return List.of();

            List<ScoreCategory> categories = new ArrayList<>();
            for (var node : catsNode) {
                categories.add(ScoreCategory.builder()
                        .min(node.has("min") ? node.get("min").asDouble() : 0)
                        .max(node.has("max") ? node.get("max").asDouble() : 999)
                        .label(node.has("label") ? node.get("label").asText() : "")
                        .severity(node.has("severity") ? node.get("severity").asText() : "UNKNOWN")
                        .color(node.has("color") ? node.get("color").asText() : "gray")
                        .build());
            }
            return categories;
        } catch (Exception e) {
            log.warn("Error parsing SCORED categories: {}", e.getMessage());
            return List.of();
        }
    }

    // --- Nested DTOs ---

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ScoredResult {
        private BigDecimal totalScore;
        private ScoreCategory category;
        private List<String> selectedLabels;

        public static ScoredResult empty() {
            return ScoredResult.builder()
                    .totalScore(BigDecimal.ZERO)
                    .category(ScoreCategory.builder().min(0).max(0).label("").severity("UNKNOWN").color("gray").build())
                    .selectedLabels(List.of())
                    .build();
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ScoreCategory {
        private double min;
        private double max;
        private String label;
        private String severity;
        private String color;
    }
}
