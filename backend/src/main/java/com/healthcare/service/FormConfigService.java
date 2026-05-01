package com.healthcare.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service to manage form question metadata stored in config_json (JSONB).
 * Supports dynamic UI, logic rules, matrix configs, calculation formulas, etc.
 */
@Service
@RequiredArgsConstructor
public class FormConfigService {

    private final ObjectMapper objectMapper;

    /**
     * Parse config_json string into JsonNode for safe navigation
     */
    public JsonNode parseConfig(String configJson) {
        if (configJson == null || configJson.isEmpty()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(configJson);
        } catch (JsonProcessingException e) {
            return objectMapper.createObjectNode();
        }
    }

    /**
     * Get string config value with fallback
     */
    public String getConfigValue(String configJson, String path, String defaultValue) {
        JsonNode node = parseConfig(configJson);
        JsonNode valueNode = node.at("/" + path.replace(".", "/"));
        return valueNode.isMissingNode() ? defaultValue : valueNode.asText(defaultValue);
    }

    /**
     * Get numeric config value
     */
    public Number getConfigNumber(String configJson, String path, Number defaultValue) {
        JsonNode node = parseConfig(configJson);
        JsonNode valueNode = node.at("/" + path.replace(".", "/"));
        return valueNode.isMissingNode() ? defaultValue : valueNode.asDouble();
    }

    /**
     * Get boolean config value
     */
    public boolean getConfigBoolean(String configJson, String path, boolean defaultValue) {
        JsonNode node = parseConfig(configJson);
        JsonNode valueNode = node.at("/" + path.replace(".", "/"));
        return valueNode.isMissingNode() ? defaultValue : valueNode.asBoolean(defaultValue);
    }

    /**
     * Extract matrix rows from config_json
     * Expected format:
     * {
     *   "matrixRows": [
     *     { "rowId": "r1", "label": "Row 1" },
     *     { "rowId": "r2", "label": "Row 2" }
     *   ]
     * }
     */
    public List<Map<String, Object>> getMatrixRows(String configJson) {
        JsonNode config = parseConfig(configJson);
        JsonNode rowsNode = config.get("matrixRows");
        
        List<Map<String, Object>> rows = new ArrayList<>();
        if (rowsNode != null && rowsNode.isArray()) {
            rowsNode.forEach(row -> {
                try {
                    Map<String, Object> rowMap = objectMapper.convertValue(row, Map.class);
                    rows.add(rowMap);
                } catch (Exception e) {
                    // Skip invalid rows
                }
            });
        }
        return rows;
    }

    /**
     * Get calculation formula from config
     * Expected format:
     * {
     *   "formula": "{{q1}} + {{q2}} * 2",
     *   "description": "BMI calculation"
     * }
     */
    public Optional<String> getCalculationFormula(String configJson) {
        String formula = getConfigValue(configJson, "formula", null);
        return Optional.ofNullable(formula);
    }

    /**
     * Get logic rules from config
     * Expected format:
     * {
     *   "logicRules": [
     *     {
     *       "condition": "{{q1}} > 10",
     *       "action": "SHOW",
     *       "targetQuestionId": "uuid"
     *     }
     *   ]
     * }
     */
    public List<Map<String, Object>> getLogicRules(String configJson) {
        JsonNode config = parseConfig(configJson);
        JsonNode rulesNode = config.get("logicRules");
        
        List<Map<String, Object>> rules = new ArrayList<>();
        if (rulesNode != null && rulesNode.isArray()) {
            rulesNode.forEach(rule -> {
                try {
                    Map<String, Object> ruleMap = objectMapper.convertValue(rule, Map.class);
                    rules.add(ruleMap);
                } catch (Exception e) {
                    // Skip invalid rules
                }
            });
        }
        return rules;
    }

    /**
     * Create or update config with new values
     */
    public String setConfigValue(String configJson, String key, Object value) {
        try {
            ObjectNode config = (ObjectNode) parseConfig(configJson);
            config.putPOJO(key, value);
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException e) {
            return configJson;
        }
    }

    /**
     * Validate config structure
     */
    public boolean isValidConfig(String configJson) {
        try {
            parseConfig(configJson);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Merge two config JSONs
     */
    public String mergeConfig(String baseConfig, String overrideConfig) throws JsonProcessingException {
        ObjectNode base = (ObjectNode) parseConfig(baseConfig);
        JsonNode override = parseConfig(overrideConfig);
        
        return objectMapper.writeValueAsString(
            base.setAll((ObjectNode) override)
        );
    }
}
