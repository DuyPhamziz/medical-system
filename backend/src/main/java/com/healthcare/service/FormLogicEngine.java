package com.healthcare.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Logic rule engine for evaluating conditional expressions.
 * Supports variables in format: {{questionId}}
 * Operations: >, <, >=, <=, ==, !=, &&, ||
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormLogicEngine {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");

    /**
     * Evaluate a condition expression with given answer values
     * Example: "{{q1}} > 5 && {{q2}} == 'YES'"
     *
     * @param expression condition expression with {{variableId}} placeholders
     * @param answerValues map of questionId -> answer value
     * @return true if condition matches, false otherwise
     */
    public boolean evaluateCondition(String expression, Map<String, Object> answerValues) {
        try {
            String evaluatedExpression = replaceVariables(expression, answerValues);
            return evaluateExpression(evaluatedExpression);
        } catch (Exception e) {
            log.warn("Error evaluating condition: {}", expression, e);
            return false;
        }
    }

    /**
     * Replace {{questionId}} with actual values from answers
     */
    private String replaceVariables(String expression, Map<String, Object> answerValues) {
        StringBuffer sb = new StringBuffer();
        Matcher matcher = VARIABLE_PATTERN.matcher(expression);
        
        while (matcher.find()) {
            String questionId = matcher.group(1);
            Object value = answerValues.get(questionId);
            
            if (value == null) {
                matcher.appendReplacement(sb, "null");
            } else if (value instanceof String) {
                matcher.appendReplacement(sb, "\"" + escapeString((String) value) + "\"");
            } else if (value instanceof Number) {
                matcher.appendReplacement(sb, value.toString());
            } else if (value instanceof Boolean) {
                matcher.appendReplacement(sb, value.toString());
            } else {
                matcher.appendReplacement(sb, "\"" + escapeString(value.toString()) + "\"");
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    /**
     * Escape string values for safe evaluation
     */
    private String escapeString(String str) {
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    /**
     * Evaluate JavaScript-like boolean expression
     * Note: This is a simple implementation using basic logic.
     * For production, consider using a safe expression language library like EvalEx.
     */
    private boolean evaluateExpression(String expression) {
        // Simple evaluation - split by logical operators
        String[] orParts = expression.split("\\|\\|");
        
        for (String orPart : orParts) {
            boolean andResult = true;
            String[] andParts = orPart.split("&&");
            
            for (String andPart : andParts) {
                if (!evaluateComparison(andPart.trim())) {
                    andResult = false;
                    break;
                }
            }
            
            if (andResult) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Evaluate a single comparison: "5 > 3", "name == 'John'"
     */
    private boolean evaluateComparison(String comparison) {
        // Remove whitespace and find operator
        comparison = comparison.trim();
        
        String[] operators = {"==", "!=", ">=", "<=", ">", "<"};
        
        for (String op : operators) {
            if (comparison.contains(op)) {
                String[] parts = comparison.split(Pattern.quote(op), 2);
                if (parts.length == 2) {
                    String left = parts[0].trim();
                    String right = parts[1].trim();
                    return compareValues(left, op, right);
                }
            }
        }
        
        // If no operator, check truthiness
        return isTruthy(comparison);
    }

    /**
     * Compare two values using the given operator
     */
    private boolean compareValues(String left, String operator, String right) {
        try {
            Object leftVal = parseValue(left);
            Object rightVal = parseValue(right);
            
            return switch (operator) {
                case "==" -> leftVal.equals(rightVal);
                case "!=" -> !leftVal.equals(rightVal);
                case ">" -> compareNumbers(leftVal, rightVal) > 0;
                case "<" -> compareNumbers(leftVal, rightVal) < 0;
                case ">=" -> compareNumbers(leftVal, rightVal) >= 0;
                case "<=" -> compareNumbers(leftVal, rightVal) <= 0;
                default -> false;
            };
        } catch (Exception e) {
            log.debug("Error in comparison: {} {} {}", left, operator, right, e);
            return false;
        }
    }

    /**
     * Parse string value to appropriate type
     */
    private Object parseValue(String value) {
        value = value.trim();
        
        // null literal
        if ("null".equalsIgnoreCase(value)) {
            return null;
        }
        
        // boolean literal
        if ("true".equalsIgnoreCase(value)) {
            return true;
        }
        if ("false".equalsIgnoreCase(value)) {
            return false;
        }
        
        // string literal (quoted)
        if ((value.startsWith("\"") && value.endsWith("\"")) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.substring(1, value.length() - 1);
        }
        
        // number
        try {
            if (value.contains(".")) {
                return Double.parseDouble(value);
            } else {
                return Long.parseLong(value);
            }
        } catch (NumberFormatException e) {
            // Fall through to return as string
        }
        
        // default to string
        return value;
    }

    /**
     * Compare two values as numbers
     */
    private int compareNumbers(Object left, Object right) {
        double leftNum = toDouble(left);
        double rightNum = toDouble(right);
        return Double.compare(leftNum, rightNum);
    }

    /**
     * Convert object to double for numeric comparison
     */
    private double toDouble(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).doubleValue();
        }
        if (obj instanceof String) {
            try {
                return Double.parseDouble((String) obj);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    /**
     * Check truthiness of a value
     */
    private boolean isTruthy(String value) {
        value = value.trim();
        return !value.isEmpty() && 
               !value.equalsIgnoreCase("false") && 
               !value.equals("0") && 
               !value.equalsIgnoreCase("null");
    }
}
