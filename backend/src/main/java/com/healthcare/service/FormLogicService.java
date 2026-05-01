package com.healthcare.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.healthcare.entity.Form;
import com.healthcare.entity.FormQuestion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * CDSS-style rule engine for conditional question visibility.
 * Evaluates logic rules stored in question.configJson to determine
 * which questions should be shown/hidden based on current answers.
 *
 * Rules are stored in configJson as:
 * {
 *   "logicRules": [
 *     {
 *       "id": "rule1",
 *       "description": "Show if age > 18",
 *       "conditions": [
 *         { "questionId": "q1", "operator": ">", "value": 18 }
 *       ],
 *       "logic": "AND",
 *       "action": "SHOW"  // or "HIDE"
 *     }
 *   ]
 * }
 */
@Service
@RequiredArgsConstructor
public class FormLogicService {

    private final ObjectMapper objectMapper;
    private final FormConfigService formConfigService;

    /**
     * Evaluate all visibility rules for a form and return a map of questionId -> visible (true/false)
     * If no rules exist for a question, it's considered visible by default.
     */
    public Map<String, Boolean> evaluateVisibility(Form form, Map<UUID, Object> answers) {
        Map<String, Boolean> visibilityMap = new HashMap<>();

        // Collect all questions from form
        List<FormQuestion> allQuestions = form.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .collect(Collectors.toList());

        // Default: all visible
        for (FormQuestion q : allQuestions) {
            if (q.getQuestionId() != null) {
                visibilityMap.put(q.getQuestionId().toString(), true);
            }
        }

        // Evaluate rules for each question
        for (FormQuestion question : allQuestions) {
            if (question.getConfigJson() == null) continue;

            try {
                JsonNode config = objectMapper.readTree(question.getConfigJson());
                JsonNode rulesNode = config.get("logicRules");

                // If no logicRules array, check for legacy single triggerLogic
                if (rulesNode == null || !rulesNode.isArray()) {
                    // Legacy format: config contains triggerLogic directly or question has triggerLogic
                    String legacyTrigger = question.getTriggerLogic();
                    if (legacyTrigger == null && config.has("triggerLogic")) {
                        legacyTrigger = config.get("triggerLogic").asText();
                    }
                    if (legacyTrigger != null && !legacyTrigger.isBlank()) {
                        boolean isVisible = evaluateLegacyTrigger(legacyTrigger, question.getQuestionId().toString(), answers);
                        visibilityMap.put(question.getQuestionId().toString(), isVisible);
                    }
                    continue;
                }

                // New format: array of logic rules
                for (JsonNode ruleNode : rulesNode) {
                    LogicRule rule = parseRule(ruleNode);
                    boolean conditionMet = evaluateConditions(rule, question.getQuestionId().toString(), answers);

                    boolean isVisible;
                    if ("HIDE".equalsIgnoreCase(rule.getAction())) {
                        isVisible = !conditionMet;
                    } else {
                        isVisible = conditionMet;
                    }

                    visibilityMap.put(question.getQuestionId().toString(), isVisible);
                }
            } catch (Exception e) {
                // Log error but continue - invalid rule defaults to visible
            }
        }

        return visibilityMap;
    }

    /**
     * Evaluate legacy single trigger logic format
     * Supports: "{{q1}} == value", "show: {{q1}} > 10", etc.
     */
    private boolean evaluateLegacyTrigger(String triggerLogic, String currentQuestionId, Map<UUID, Object> answers) {
        try {
            // Parse action prefix
            String action = "show";
            String expression = triggerLogic;
            if (triggerLogic.startsWith("show:")) {
                expression = triggerLogic.substring(5).trim();
            } else if (triggerLogic.startsWith("hide:")) {
                action = "hide";
                expression = triggerLogic.substring(5).trim();
            }

            // Replace {{questionId}} with actual values
            String varPattern = "\\{\\{([^}]+)\\}\\}";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(varPattern);
            java.util.regex.Matcher matcher = pattern.matcher(expression);

            while (matcher.find()) {
                String qId = matcher.group(1);
                try {
                    UUID uuid = UUID.fromString(qId);
                    Object answerObj = answers.get(uuid);
                    String valStr = extractSimpleValue(answerObj);
                    String safeVal = (valStr != null && !valStr.equals("null")) ? ("'" + valStr + "'") : "null";
                    expression = matcher.replaceFirst(MATLAB_STRING_LITERAL_PATTERN.matcher(safeVal).replaceAll("\\\\$1"));
                    matcher = pattern.matcher(expression); // reset matcher
                } catch (IllegalArgumentException e) {
                    // Not a UUID, might be a hardcoded string or other reference
                    expression = matcher.replaceFirst("'" + qId + "'");
                    matcher = pattern.matcher(expression);
                }
            }

            // Evaluate using simple expression parser
            boolean result = evaluateSimpleExpression(expression);
            return "show".equals(action) ? result : !result;
        } catch (Exception e) {
            return true; // defaults to visible on error
        }
    }

    private static final java.util.regex.Pattern MATLAB_STRING_LITERAL_PATTERN = java.util.regex.Pattern.compile("(['\\\\])");

    /**
     * Simple expression evaluator for boolean expressions like:
     * "10 > 5", "'abc' == 'def'", "x > 10 && y < 20", "value == 'yes' || value == 'no'"
     */
    private boolean evaluateSimpleExpression(String expression) {
        // Normalize: remove spaces, handle && and ||
        String expr = expression.replaceAll("\\s+", "");

        // Split by || first (lowest precedence)
        if (expr.contains("||")) {
            String[] orParts = expr.split("\\|\\|", -1);
            for (String part : orParts) {
                if (evaluateSimpleExpression(part)) {
                    return true;
                }
            }
            return false;
        }

        // Split by && next
        if (expr.contains("&&")) {
            String[] andParts = expr.split("&&", -1);
            for (String part : andParts) {
                if (!evaluateSimpleExpression(part)) {
                    return false;
                }
            }
            return true;
        }

        // Handle comparison operators
        String[] operators = {"==", "!=", ">=", "<=", ">", "<"};
        for (String op : operators) {
            if (expr.contains(op)) {
                String[] sides = expr.split(java.util.regex.Pattern.quote(op), 2);
                if (sides.length == 2) {
                    Object left = parseValue(sides[0]);
                    Object right = parseValue(sides[1]);
                    return compare(left, op, right);
                }
            }
        }

        // Boolean literal
        return Boolean.parseBoolean(expr);
    }

    private Object parseValue(String s) {
        if (s == null) return null;
        s = s.trim();
        if (s.startsWith("'") && s.endsWith("'")) {
            return s.substring(1, s.length() - 1);
        }
        if (s.equals("null") || s.equals("undefined")) {
            return null;
        }
        if (s.equals("true")) return true;
        if (s.equals("false")) return false;
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return s;
        }
    }

    private String extractSimpleValue(Object answerObj) {
        if (answerObj == null) return "null";
        if (answerObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) answerObj;
            Object v = map.get("optionId");
            if (v != null) return String.valueOf(v);
            v = map.get("valueText");
            if (v != null) return String.valueOf(v);
            v = map.get("valueNumber");
            if (v != null) return String.valueOf(v);
            v = map.get("valueDate");
            if (v != null) return String.valueOf(v);
            v = map.get("valueBoolean");
            if (v != null) return String.valueOf(v);
            v = map.get("valueJson");
            if (v != null) return String.valueOf(v);
        }
        return String.valueOf(answerObj);
    }

    /**
     * Evaluate a single logic rule against provided answers
     */
    private boolean evaluateConditions(LogicRule rule, String currentQuestionId, Map<UUID, Object> answers) {
        if (rule.getConditions() == null || rule.getConditions().isEmpty()) {
            return true; // No conditions = always true
        }

        List<Boolean> results = new ArrayList<>();
        for (Condition condition : rule.getConditions()) {
            // Don't evaluate condition on the question itself (circular reference prevention)
            if (condition.getQuestionId().equals(currentQuestionId)) {
                continue;
            }

            // Convert UUID to string key for answer lookup
            UUID qId = UUID.fromString(condition.getQuestionId());
            Object answerObj = answers.get(qId);

            // Handle different answer formats
            Object value = extractValue(answerObj, condition.getDataType());

            boolean conditionMet = compare(value, condition.getOperator(), condition.getValue());
            results.add(conditionMet);
        }

        if (results.isEmpty()) {
            return true;
        }

        // Combine results with logic operator
        if ("OR".equalsIgnoreCase(rule.getLogic())) {
            return results.stream().anyMatch(Boolean::booleanValue);
        } else {
            // Default to AND
            return results.stream().allMatch(Boolean::booleanValue);
        }
    }

    /**
     * Extract the actual value from an answer object based on data type
     */
    private Object extractValue(Object answer, String dataType) {
        if (answer == null) return null;

        // answer can be a Map (from JSON) or a specific DTO
        if (answer instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) answer;

            if ("text".equalsIgnoreCase(dataType) || "string".equalsIgnoreCase(dataType)) {
                return map.get("valueText");
            } else if ("number".equalsIgnoreCase(dataType) || "numeric".equalsIgnoreCase(dataType)) {
                return map.get("valueNumber");
            } else if ("date".equalsIgnoreCase(dataType)) {
                return map.get("valueDate");
            } else if ("boolean".equalsIgnoreCase(dataType)) {
                return map.get("valueBoolean");
            } else if ("option".equalsIgnoreCase(dataType) || "choice".equalsIgnoreCase(dataType)) {
                return map.get("optionId");
            } else if ("json".equalsIgnoreCase(dataType)) {
                return map.get("valueJson");
            }
            // Default: try to get any non-null value
            return map.get("valueText") != null ? map.get("valueText") :
                   map.get("valueNumber") != null ? map.get("valueNumber") :
                   map.get("optionId") != null ? map.get("optionId") :
                   map.get("valueJson");
        }

        return answer;
    }

    /**
     * Compare actual value against expected value using operator
     */
    private boolean compare(Object actual, String operator, Object expected) {
        if (actual == null) {
            return "is_empty".equalsIgnoreCase(operator) || "not_equals".equalsIgnoreCase(operator);
        }

        String actualStr = String.valueOf(actual).trim();
        String expectedStr = String.valueOf(expected).trim();

        try {
            // Try numeric comparison
            double actualNum = Double.parseDouble(actualStr);
            double expectedNum = Double.parseDouble(expectedStr);

            switch (operator.toLowerCase()) {
                case ">": return actualNum > expectedNum;
                case ">=": return actualNum >= expectedNum;
                case "<": return actualNum < expectedNum;
                case "<=": return actualNum <= expectedNum;
                case "equals": return actualNum == expectedNum;
                case "not_equals": return actualNum != expectedNum;
            }
        } catch (NumberFormatException ignored) {
            // Not numeric, use string comparison
        }

        switch (operator.toLowerCase()) {
            case "equals": return actualStr.equals(expectedStr);
            case "not_equals": return !actualStr.equals(expectedStr);
            case "contains": return actualStr.toLowerCase().contains(expectedStr.toLowerCase());
            case "starts_with": return actualStr.toLowerCase().startsWith(expectedStr.toLowerCase());
            case "ends_with": return actualStr.toLowerCase().endsWith(expectedStr.toLowerCase());
            case "is_empty": return actualStr.isEmpty();
            case "is_not_empty": return !actualStr.isEmpty();
            case "matches": return actualStr.matches(expectedStr); // regex
            default: return false;
        }
    }

    /**
     * Parse rule node into LogicRule object
     */
    private LogicRule parseRule(JsonNode ruleNode) {
        LogicRule rule = new LogicRule();

        JsonNode idNode = ruleNode.get("id");
        if (idNode != null && idNode.isTextual()) {
            rule.setId(idNode.asText());
        }

        JsonNode descNode = ruleNode.get("description");
        if (descNode != null && descNode.isTextual()) {
            rule.setDescription(descNode.asText());
        }

        JsonNode actionNode = ruleNode.get("action");
        if (actionNode != null && actionNode.isTextual()) {
            rule.setAction(actionNode.asText());
        } else {
            rule.setAction("SHOW"); // default
        }

        JsonNode logicNode = ruleNode.get("logic");
        if (logicNode != null && logicNode.isTextual()) {
            rule.setLogic(logicNode.asText());
        } else {
            rule.setLogic("AND"); // default
        }

        JsonNode conditionsNode = ruleNode.get("conditions");
        if (conditionsNode != null && conditionsNode.isArray()) {
            List<Condition> conditions = new ArrayList<>();
            for (JsonNode condNode : conditionsNode) {
                Condition cond = new Condition();

                JsonNode qIdNode = condNode.get("questionId");
                if (qIdNode != null && qIdNode.isTextual()) {
                    cond.setQuestionId(qIdNode.asText());
                }

                JsonNode opNode = condNode.get("operator");
                if (opNode != null && opNode.isTextual()) {
                    cond.setOperator(opNode.asText());
                }

                JsonNode valNode = condNode.get("value");
                if (valNode != null && !valNode.isNull()) {
                    cond.setValue(objectMapper.convertValue(valNode, Object.class));
                }

                JsonNode typeNode = condNode.get("dataType");
                if (typeNode != null && typeNode.isTextual()) {
                    cond.setDataType(typeNode.asText());
                } else {
                    cond.setDataType("text"); // default
                }

                conditions.add(cond);
            }
            rule.setConditions(conditions);
        }

        return rule;
    }

    /**
     * Simple rule DTO for internal use
     */
    private static class LogicRule {
        private String id;
        private String description;
        private String action; // SHOW or HIDE
        private String logic;  // AND or OR
        private List<Condition> conditions;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getLogic() { return logic; }
        public void setLogic(String logic) { this.logic = logic; }
        public List<Condition> getConditions() { return conditions; }
        public void setConditions(List<Condition> conditions) { this.conditions = conditions; }
    }

    private static class Condition {
        private String questionId;
        private String operator;
        private Object value;
        private String dataType;

        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
        public String getDataType() { return dataType; }
        public void setDataType(String dataType) { this.dataType = dataType; }
    }
}
