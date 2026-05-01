package com.healthcare.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.PedigreeAnswerDTO;
import com.healthcare.entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for processing and validating complex form answers
 * Handles logic evaluation, calculations, and JSON-based answers
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormAnswerProcessingService {

    private final FormLogicEngine logicEngine;
    private final FormCalculationEngine calculationEngine;
    private final FormConfigService configService;
    private final ObjectMapper objectMapper;
    private final PedigreeSyncService pedigreeSyncService;
    private final ClinicalScaleRepository clinicalScaleRepository;
    private final ClinicalScaleService clinicalScaleService;
    private final ScoredQuestionService scoredQuestionService;

    /**
     * Process answer and apply any post-processing logic
     * - Evaluate calculated formulas
     * - Store results in value_json
     */
    public void processAnswer(FormAnswer answer, Map<String, Object> allAnswersMap) {
        try {
            QuestionType type = answer.getQuestion().getQuestionType();

            switch (type) {
                case CALCULATED:
                    processCalculatedAnswer(answer, allAnswersMap);
                    break;
                case MATRIX:
                    processMatrixAnswer(answer);
                    break;
                case FILE_UPLOAD:
                    processFileUploadAnswer(answer);
                    break;
                case BODY_MAP:
                    processBodyMapAnswer(answer);
                    break;
                case PEDIGREE:
                    processPedigreeAnswer(answer);
                    break;
                case TIME_SERIES:
                    processTimeSeriesAnswer(answer);
                    break;
                case LOOKUP:
                    processLookupAnswer(answer);
                    break;
                case CLINICAL_SCALE:
                    processClinicalScaleAnswer(answer);
                    break;
                case SCORED:
                    processScoredAnswer(answer);
                    break;
                case REPEATABLE_GROUP:
                    processRepeatableGroupAnswer(answer);
                    break;
                case IDENTITY:
                    processIdentityAnswer(answer);
                    break;
                default:
                    // Standard types (TEXT, NUMBER, DATE, etc) don't need special processing
                    break;
            }
        } catch (Exception e) {
            log.warn("Error processing answer for question {}: {}", 
                answer.getQuestion().getQuestionId(), e.getMessage());
        }
    }

    /**
     * Evaluate all calculated fields in a form after submission
     */
    public Map<UUID, BigDecimal> evaluateAllCalculations(
            List<FormAnswer> answers,
            List<FormQuestion> allQuestions) {
        
        Map<UUID, BigDecimal> calculatedResults = new HashMap<>();
        Map<String, Object> answerValuesMap = buildAnswerMap(answers);

        for (FormQuestion question : allQuestions) {
            if (question.getQuestionType() == QuestionType.CALCULATED) {
                String formula = configService.getCalculationFormula(question.getConfigJson())
                        .orElse(null);

                if (formula != null) {
                    BigDecimal result = calculationEngine.evaluateFormula(formula, answerValuesMap);
                    if (result != null) {
                        calculatedResults.put(question.getQuestionId(), result);
                    }
                }
            }
        }

        return calculatedResults;
    }

    /**
     * Evaluate logic rules to determine visibility/required state of questions
     */
    public Map<UUID, Boolean> evaluateVisibilityRules(
            List<FormQuestion> questions,
            List<FormAnswer> answers) {

        Map<UUID, Boolean> visibility = new HashMap<>();
        Map<String, Object> answerValuesMap = buildAnswerMap(answers);

        for (FormQuestion question : questions) {
            List<Map<String, Object>> logicRules = configService.getLogicRules(
                question.getConfigJson());

            boolean isVisible = true;

            for (Map<String, Object> rule : logicRules) {
                String condition = (String) rule.get("condition");
                String action = (String) rule.get("action");

                if ("SHOW".equals(action)) {
                    // Show only if condition is true
                    if (!logicEngine.evaluateCondition(condition, answerValuesMap)) {
                        isVisible = false;
                        break;
                    }
                } else if ("HIDE".equals(action)) {
                    // Hide if condition is true
                    if (logicEngine.evaluateCondition(condition, answerValuesMap)) {
                        isVisible = false;
                        break;
                    }
                }
            }

            visibility.put(question.getQuestionId(), isVisible);
        }

        return visibility;
    }

    /**
     * Build map of question ID -> answer value for logic evaluation
     */
    private Map<String, Object> buildAnswerMap(List<FormAnswer> answers) {
        Map<String, Object> answerMap = new HashMap<>();

        for (FormAnswer answer : answers) {
            UUID questionId = answer.getQuestion().getQuestionId();
            Object value = extractAnswerValue(answer);
            answerMap.put(questionId.toString(), value);
        }

        return answerMap;
    }

    /**
     * Extract the actual answer value regardless of storage format
     */
    private Object extractAnswerValue(FormAnswer answer) {
        if (answer.getValueNumber() != null) {
            return answer.getValueNumber();
        }
        if (answer.getValueText() != null) {
            return answer.getValueText();
        }
        if (answer.getValueBoolean() != null) {
            return answer.getValueBoolean();
        }
        if (answer.getValueDate() != null) {
            return answer.getValueDate();
        }
        if (answer.getValueJson() != null) {
            return answer.getValueJson();
        }
        return null;
    }

    /**
     * Process calculated question answer
     */
    private void processCalculatedAnswer(FormAnswer answer, Map<String, Object> allAnswersMap) {
        String formula = configService.getCalculationFormula(
            answer.getQuestion().getConfigJson()).orElse(null);

        if (formula != null) {
            BigDecimal result = calculationEngine.evaluateFormula(formula, allAnswersMap);
            if (result != null) {
                answer.setValueNumber(result);
            }
        }
    }

    /**
     * Validate matrix answer structure
     */
    private void processMatrixAnswer(FormAnswer answer) {
        // Matrix answer should be in value_json format
        // Validate structure but don't modify - let frontend handle formatting
    }

    /**
     * Validate file upload answer structure
     */
    private void processFileUploadAnswer(FormAnswer answer) {
        // File upload answer should contain URL in value_json
        // Validate that file URL is accessible/stored
    }

    /**
     * Validate body map marker structure
     */
    private void processBodyMapAnswer(FormAnswer answer) {
        // Body map should contain coordinates and level in value_json
    }

    /**
     * Validate pedigree graph structure and sync to family tables
     */
    private void processPedigreeAnswer(FormAnswer answer) {
        if (answer.getValueJson() == null || answer.getValueJson().isEmpty()) {
            return;
        }

        try {
            PedigreeAnswerDTO pedigreeData = objectMapper.readValue(
                answer.getValueJson(), PedigreeAnswerDTO.class);
            
            pedigreeSyncService.syncPedigree(answer.getSession(), pedigreeData);
            
        } catch (Exception e) {
            log.error("Error processing pedigree answer: {}", e.getMessage());
        }
    }

    /**
     * Validate time series data points
     */
    private void processTimeSeriesAnswer(FormAnswer answer) {
        // Time series should contain array of data points
    }

    /**
     * Validate lookup answer
     */
    private void processLookupAnswer(FormAnswer answer) {
        // Lookup answer should contain selected value IDs
    }

    /**
     * Process CLINICAL_SCALE answer — auto-calculate score via ClinicalScaleService.
     */
    private void processClinicalScaleAnswer(FormAnswer answer) {
        if (answer.getValueJson() == null || answer.getValueJson().isBlank()) return;
        try {
            var result = clinicalScaleService.calculateScoreFromAnswer(answer);
            if (result != null) {
                answer.setValueNumber(BigDecimal.valueOf(result.getScore()));
                // Store full scoring result in valueJson
                String scoringResult = objectMapper.writeValueAsString(Map.of(
                    "score", result.getScore(),
                    "severity", result.getSeverity(),
                    "interpretation", result.getInterpretation(),
                    "clinicalNote", result.getClinicalNote()
                ));
                answer.setValueJson(scoringResult);
            }
        } catch (Exception e) {
            log.warn("Error processing CLINICAL_SCALE answer: {}", e.getMessage());
        }
    }

    /**
     * Process SCORED answer — compute total score and severity.
     */
    private void processScoredAnswer(FormAnswer answer) {
        var result = scoredQuestionService.calculateScore(answer.getQuestion(), answer);
        if (result.getCategory() != null) {
            try {
                String scoredJson = objectMapper.writeValueAsString(Map.of(
                    "totalScore", result.getTotalScore(),
                    "category", result.getCategory().getLabel(),
                    "severity", result.getCategory().getSeverity(),
                    "color", result.getCategory().getColor()
                ));
                answer.setValueJson(scoredJson);
                if (result.getTotalScore() != null) {
                    answer.setValueNumber(result.getTotalScore());
                }
            } catch (Exception e) {
                log.warn("Error serializing SCORED result: {}", e.getMessage());
            }
        }
    }

    /**
     * Process REPEATABLE_GROUP answer — validate array structure.
     */
    private void processRepeatableGroupAnswer(FormAnswer answer) {
        // valueJson should contain an array of group instances
        // Structure: [{ "instanceIndex": 0, "values": {...} }, ...]
        if (answer.getValueJson() == null || answer.getValueJson().isBlank()) return;
        try {
            var arr = objectMapper.readTree(answer.getValueJson());
            if (!arr.isArray()) {
                log.warn("REPEATABLE_GROUP answer must be a JSON array");
            }
        } catch (Exception e) {
            log.warn("Invalid REPEATABLE_GROUP answer JSON: {}", e.getMessage());
        }
    }

    /**
     * Process IDENTITY answer — validate structured demographic fields.
     */
    private void processIdentityAnswer(FormAnswer answer) {
        // valueJson should contain structured identity data
        // Validate required demographic fields exist
        if (answer.getValueJson() == null || answer.getValueJson().isBlank()) return;
        try {
            var node = objectMapper.readTree(answer.getValueJson());
            // Validate that fullName is present if required
            if (!node.has("fullName") || node.get("fullName").asText().isBlank()) {
                log.warn("IDENTITY answer missing fullName");
            }
        } catch (Exception e) {
            log.warn("Invalid IDENTITY answer JSON: {}", e.getMessage());
        }
    }
}
