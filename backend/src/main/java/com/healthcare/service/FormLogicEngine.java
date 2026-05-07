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
        if (expression == null || expression.isBlank()) return true;
        
        // Split by || first (lowest precedence)
        String[] orParts = splitByTopLevel(expression, "||");
        if (orParts.length > 1) {
            for (String part : orParts) {
                if (evaluateExpression(part)) return true;
            }
            return false;
        }
        
        // Split by &&
        String[] andParts = splitByTopLevel(expression, "&&");
        if (andParts.length > 1) {
            for (String part : andParts) {
                if (!evaluateExpression(part)) return false;
            }
            return true;
        }
        
        // Handle parentheses
        String trimmed = expression.trim();
        if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
            return evaluateExpression(trimmed.substring(1, trimmed.length() - 1));
        }
        
        // Handle NOT
        if (trimmed.startsWith("!")) {
            return !evaluateExpression(trimmed.substring(1));
        }

        return evaluateComparison(trimmed);
    }

    private String[] splitByTopLevel(String expr, String op) {
        java.util.List<String> parts = new java.util.ArrayList<>();
        int depth = 0;
        int lastPos = 0;
        for (int i = 0; i < expr.length() - op.length() + 1; i++) {
            char c = expr.charAt(i);
            if (c == '(') depth++;
            else if (c == ')') depth--;
            else if (depth == 0 && expr.startsWith(op, i)) {
                parts.add(expr.substring(lastPos, i));
                lastPos = i + op.length();
                i += op.length() - 1;
            }
        }
        parts.add(expr.substring(lastPos));
        return parts.toArray(new String[0]);
    }

    private boolean evaluateComparison(String comparison) {
        comparison = comparison.trim();
        
        // String functions
        if (comparison.contains(".includes(")) {
            return evaluateIncludes(comparison);
        }

        String[] operators = {"===", "!==", "==", "!=", ">=", "<=", ">", "<"};
        
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
    private boolean evaluateIncludes(String comparison) {
        Pattern pattern = Pattern.compile("(.+)\\.includes\\((.+)\\)");
        Matcher matcher = pattern.matcher(comparison);
        if (matcher.find()) {
            String left = matcher.group(1).trim();
            String right = matcher.group(2).trim();
            Object leftVal = parseValue(left);
            Object rightVal = parseValue(right);
            if (leftVal instanceof java.util.Collection) {
                return ((java.util.Collection<?>) leftVal).contains(rightVal);
            }
            if (leftVal instanceof String) {
                return ((String) leftVal).contains(String.valueOf(rightVal));
            }
        }
        return false;
    }

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
