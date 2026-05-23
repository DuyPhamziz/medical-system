package com.healthcare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.*;
import com.healthcare.entity.*;
import com.healthcare.repository.ClinicalScaleRepository;
import com.healthcare.repository.FormRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for clinical scale management and scoring
 * Handles PHQ-9, GAD-7, DASS-21, ISI, PSQI and other standardized assessments
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class ClinicalScaleService {

    @Autowired
    private ClinicalScaleRepository scaleRepository;

    @Autowired
    private FormRepository formRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Get all available scales
     */
    @Cacheable(value = "clinicalScales", unless = "#result == null or #result.isEmpty()")
    public List<ClinicalScaleResponse> getAllScales() {
        return scaleRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get scales by category
     */
    @Cacheable(value = "clinicalScales", key = "#category")
    public List<ClinicalScaleResponse> getScalesByCategory(String category) {
        return scaleRepository.findByIsActiveTrueAndCategory(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get scale detail by ID or name
     */
    @Cacheable(value = "clinicalScales", key = "#scaleId != null ? #scaleId : #scaleName")
    public ClinicalScaleResponse getScaleDetail(UUID scaleId, String scaleName) {
        Optional<ClinicalScale> scale = (scaleId != null)
                ? scaleRepository.findById(scaleId)
                : scaleRepository.findByNameIgnoreCase(scaleName);

        if (scale.isEmpty()) {
            throw new IllegalArgumentException("Scale not found");
        }

        return toResponse(scale.get());
    }

    /**
     * Insert clinical scale into form (creates questions from scale template)
     */
    @Transactional
    public ClinicalScaleInsertResponse insertScaleIntoForm(
            UUID formId,
            ClinicalScaleInsertRequest request) {

        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new IllegalArgumentException("Form not found"));

        ClinicalScale scale = scaleRepository.findById(request.getScaleId())
                .orElseThrow(() -> new IllegalArgumentException("Scale not found"));

        // Find target section
        FormSection section = form.getSections().stream()
                .filter(s -> s.getSectionId().equals(request.getSectionId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        // Parse scale config
        JsonNode configNode = parseJson(scale.getConfigJson());
        JsonNode questionsNode = configNode.get("questions");

        int questionsAdded = 0;

        // Create questions from scale template
        if (questionsNode.isArray()) {
            for (int i = 0; i < questionsNode.size(); i++) {
                JsonNode qNode = questionsNode.get(i);

                FormQuestion question = FormQuestion.builder()
                        .questionId(UUID.randomUUID())
                        .section(section)
                        .content(qNode.get("content").asText())
                        .questionType(QuestionType.SCALE)
                        .required(true)
                        .scaleMin(qNode.has("scaleMin") ? qNode.get("scaleMin").asInt() : 0)
                        .scaleMax(qNode.has("scaleMax") ? qNode.get("scaleMax").asInt() : 3)
                        .orderIndex(section.getQuestions().size() + questionsAdded)
                        .configJson(qNode.toString())  // Store scale labels in config
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

                section.getQuestions().add(question);
                questionsAdded++;
            }
        }

        // Save updated form
        formRepository.save(form);
        log.info("Inserted {} questions from scale {} into form {}", 
                questionsAdded, scale.getName(), formId);

        return ClinicalScaleInsertResponse.builder()
                .formId(formId)
                .questionsAdded(questionsAdded)
                .message(String.format("Successfully inserted %s scale with %d questions", 
                        scale.getName(), questionsAdded))
                .build();
    }

    /**
     * Calculate score from answers
     */
    @Transactional
    public ClinicalScaleScoreResponse calculateScore(
            UUID scaleId,
            ClinicalScaleScoreRequest request) {

        ClinicalScale scale = scaleRepository.findById(scaleId)
                .orElseThrow(() -> new IllegalArgumentException("Scale not found"));

        // Parse config to get scoring logic
        JsonNode configNode = parseJson(scale.getConfigJson());
        JsonNode scoringNode = configNode.get("scoring");

        int score = 0;

        // Sum up scores from all questions
        if (scoringNode != null && scoringNode.has("type") && scoringNode.get("type").asText().equals("SUM")) {
            JsonNode sourceQuestionsNode = scoringNode.get("sourceQuestions");
            if (sourceQuestionsNode.isArray()) {
                for (int i = 0; i < sourceQuestionsNode.size(); i++) {
                    String questionId = sourceQuestionsNode.get(i).asText();
                    Object answer = request.getAnswers().get(questionId);
                    if (answer != null) {
                        try {
                            score += Integer.parseInt(answer.toString());
                        } catch (NumberFormatException e) {
                            log.warn("Invalid answer for {}: {}", questionId, answer);
                        }
                    }
                }
            }
        }

        // Interpret score
        return interpretScore(scale, score);
    }

    /**
     * Calculate score from a FormAnswer entity (used during answer processing).
     * Parses the valueJson to extract individual item scores and sums them.
     */
    public ClinicalScaleScoreResponse calculateScoreFromAnswer(FormAnswer answer) {
        FormQuestion question = answer.getQuestion();
        if (question.getClinicalScale() == null) {
            return ClinicalScaleScoreResponse.builder()
                    .score(0)
                    .interpretation("No scale assigned")
                    .severity("UNKNOWN")
                    .build();
        }

        ClinicalScale scale = question.getClinicalScale();
        int score = 0;

        // Parse valueJson which should contain individual item scores
        if (answer.getValueJson() != null && !answer.getValueJson().isBlank()) {
            try {
                JsonNode valueNode = objectMapper.readTree(answer.getValueJson());
                JsonNode itemsNode = valueNode.get("items");
                if (itemsNode != null && itemsNode.isArray()) {
                    for (JsonNode item : itemsNode) {
                        if (item.has("score")) {
                            score += item.get("score").asInt();
                        }
                    }
                }
                // Also check for direct "score" field
                if (valueNode.has("score")) {
                    score = valueNode.get("score").asInt();
                }
            } catch (Exception e) {
                log.warn("Error parsing CLINICAL_SCALE answer JSON: {}", e.getMessage());
            }
        }

        return interpretScore(scale, score);
    }

    /**
     * Interpret raw score based on thresholds
     */
    private ClinicalScaleScoreResponse interpretScore(ClinicalScale scale, int score) {
        JsonNode interpretationNode = parseJson(scale.getInterpretationJson());
        JsonNode thresholdsNode = interpretationNode.get("thresholds");

        String interpretation = "Unknown";
        String severity = "UNKNOWN";
        String clinicalNote = "";
        List<String> recommendations = new ArrayList<>();

        // Find matching threshold
        if (thresholdsNode.isArray()) {
            for (int i = 0; i < thresholdsNode.size(); i++) {
                JsonNode threshold = thresholdsNode.get(i);
                int min = threshold.get("min").asInt();
                int max = threshold.get("max").asInt();

                if (score >= min && score <= max) {
                    interpretation = threshold.get("label").asText();
                    severity = threshold.has("severity")
                            ? threshold.get("severity").asText()
                            : "UNKNOWN";
                    break;
                }
            }
        }

        // Generate clinical note based on scale type
        clinicalNote = generateClinicalNote(scale.getName(), score, interpretation);
        recommendations = generateRecommendations(scale.getName(), severity);

        return ClinicalScaleScoreResponse.builder()
                .score(score)
                .interpretation(interpretation)
                .severity(severity)
                .clinicalNote(clinicalNote)
                .recommendations(recommendations)
                .build();
    }

    /**
     * Generate clinical note based on scale and score
     */
    private String generateClinicalNote(String scaleName, int score, String interpretation) {
        return switch (scaleName.toUpperCase()) {
            case "PHQ-9" -> {
                if (score <= 4) yield "No significant depressive symptoms detected.";
                else if (score <= 9) yield "Patient reports mild depressive symptoms. Monitor for changes.";
                else if (score <= 14) yield "Moderate depressive symptoms present. Consider intervention.";
                else if (score <= 19) yield "Moderately severe depressive symptoms. Clinical attention recommended.";
                else yield "Severe depressive symptoms present. Urgent clinical follow-up needed.";
            }
            case "GAD-7" -> {
                if (score <= 4) yield "No significant anxiety symptoms.";
                else if (score <= 9) yield "Mild anxiety symptoms reported.";
                else if (score <= 14) yield "Moderate anxiety symptoms. Consider treatment options.";
                else yield "Severe anxiety symptoms. Recommend clinical evaluation.";
            }
            case "DASS-21" -> "Multiple domain assessment completed. See subscale scores for details.";
            default -> String.format("Score: %d (%s)", score, interpretation);
        };
    }

    /**
     * Generate clinical recommendations based on severity
     */
    private List<String> generateRecommendations(String scaleName, String severity) {
        List<String> recommendations = new ArrayList<>();

        if (severity.equals("NORMAL")) {
            recommendations.add("Continue routine monitoring.");
            recommendations.add("Encourage healthy lifestyle practices.");
        } else if (severity.equals("MILD")) {
            recommendations.add("Monitor for symptom progression.");
            recommendations.add("Consider psychoeducation resources.");
            recommendations.add("Follow-up assessment in 2-4 weeks.");
        } else if (severity.equals("MODERATE")) {
            recommendations.add("Consider therapeutic intervention.");
            recommendations.add("Evaluate for medication need.");
            recommendations.add("Structured follow-up recommended.");
        } else if (severity.equals("SEVERE")) {
            recommendations.add("Urgent clinical evaluation needed.");
            recommendations.add("Consider psychiatric referral.");
            recommendations.add("Assess for safety concerns.");
            recommendations.add("Intensive treatment planning indicated.");
        }

        return recommendations;
    }

    /**
     * Convert entity to response DTO
     */
    private ClinicalScaleResponse toResponse(ClinicalScale scale) {
        JsonNode configNode = parseJson(scale.getConfigJson());
        JsonNode interpretationNode = parseJson(scale.getInterpretationJson());

        List<ClinicalScaleQuestion> questions = new ArrayList<>();
        if (configNode.has("questions") && configNode.get("questions").isArray()) {
            for (JsonNode qNode : configNode.get("questions")) {
                questions.add(ClinicalScaleQuestion.builder()
                        .questionId(qNode.get("qId").asText())
                        .content(qNode.get("content").asText())
                        .type(qNode.get("type").asText("SCALE"))
                        .scaleMin(qNode.has("scaleMin") ? qNode.get("scaleMin").asInt() : null)
                        .scaleMax(qNode.has("scaleMax") ? qNode.get("scaleMax").asInt() : null)
                        .scaleLabels(objectMapper.convertValue(
                                qNode.get("scaleLabels"), Map.class))
                        .build());
            }
        }

        return ClinicalScaleResponse.builder()
                .scaleId(scale.getScaleId())
                .name(scale.getName())
                .description(scale.getDescription())
                .category(scale.getCategory())
                .totalQuestions(scale.getTotalQuestions())
                .minScore(scale.getMinScore())
                .maxScore(scale.getMaxScore())
                .scoringFormat(scale.getScoringFormat())
                .questions(questions)
                .interpretation(objectMapper.convertValue(interpretationNode, Map.class))
                .build();
    }

    /**
     * Parse JSON string safely
     */
    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json != null ? json : "{}");
        } catch (Exception e) {
            log.warn("Error parsing JSON: {}", e.getMessage());
            return objectMapper.createObjectNode();
        }
    }
}
