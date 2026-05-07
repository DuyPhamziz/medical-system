package com.healthcare.service.engine;

import com.healthcare.entity.Form;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.objecthunter.exp4j.Expression;
import net.objecthunter.exp4j.ExpressionBuilder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Evaluates mathematical expressions using question references
 * Formula format: {{questionId}} - e.g., "{{123e4567-e89b-12d3-a456-426614174000}} + 10"
 * Also supports: sum(), avg(), min(), max(), if(), count()
 */
@Component
public class FormExpressionEvaluator {

    private final ObjectMapper objectMapper;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FormExpressionEvaluator.class);

    public FormExpressionEvaluator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Evaluates a formula with question references
     * @param formula Formula string with {{questionId}} placeholders
     * @param currentAnswers Map of questionId -> current answer values
     * @param form The form context
     * @return Computed value as BigDecimal
     */
    public Object evaluateFormula(String formula, Map<UUID, Object> currentAnswers, Form form) {
        if (formula == null || formula.isBlank()) {
            return null;
        }

        try {
            String processedFormula = formula.replace("CURRENT_YEAR", String.valueOf(java.time.Year.now().getValue()));

            // Check if it's a function call
            if (processedFormula.matches("^(sum|avg|min|max|if|count|AGE)\\(.*\\)")) {
                return evaluateFunction(processedFormula, currentAnswers);
            }

            // Replace {{uuid}} with variable names for expr4j
            processedFormula = replaceQuestionReferences(processedFormula);

            // Build and evaluate expression using expr4j
            Expression expression = new ExpressionBuilder(processedFormula)
                    .variables(extractVariableNames(processedFormula))
                    .build();

            // Set variable values
            for (String var : extractVariableNames(processedFormula)) {
                Object value = currentAnswers.get(UUID.fromString(var));
                if (value != null) {
                    expression.setVariable(var, toDouble(value));
                }
                // If value not found, expr4j will throw exception - that's okay
            }

            double result = expression.evaluate();
            return BigDecimal.valueOf(result);
        } catch (Exception e) {
            log.error("Error evaluating formula '{}': {}", formula, e.getMessage());
            return null;
        }
    }

    private String replaceQuestionReferences(String formula) {
        return formula.replaceAll("\\{\\{([a-fA-F0-9-]+)\\}\\}", "$1");
    }

    private String[] extractVariableNames(String formula) {
        java.util.List<String> variables = new java.util.ArrayList<>();
        Pattern pattern = Pattern.compile("\\{\\{([a-fA-F0-9-]+)\\}\\}");
        Matcher matcher = pattern.matcher(formula);
        while (matcher.find()) {
            variables.add(matcher.group(1));
        }
        return variables.toArray(new String[0]);
    }

    private double toDouble(Object value) {
        if (value instanceof Number num) {
            return num.doubleValue();
        }
        if (value instanceof Boolean bool) {
            return bool ? 1.0 : 0.0;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    // ========== FUNCTION EVALUATION ==========

    private Object evaluateFunction(String functionCall, Map<UUID, Object> currentAnswers) {
        String funcName = functionCall.substring(0, functionCall.indexOf('('));
        String argsStr = functionCall.substring(funcName.length() + 1, functionCall.lastIndexOf(')'));

        return switch (funcName) {
            case "sum" -> evaluateSum(argsStr, currentAnswers);
            case "avg" -> evaluateAvg(argsStr, currentAnswers);
            case "min" -> evaluateMin(argsStr, currentAnswers);
            case "max" -> evaluateMax(argsStr, currentAnswers);
            case "if" -> evaluateIf(argsStr, currentAnswers);
            case "count" -> evaluateCount(argsStr, currentAnswers);
            case "AGE" -> evaluateAge(argsStr, currentAnswers);
            default -> null;
        };
    }

    private Object evaluateAge(String argsStr, Map<UUID, Object> currentAnswers) {
        Object birthDateObj = resolveArgument(argsStr, currentAnswers);
        if (birthDateObj == null) return null;

        try {
            java.time.LocalDate birthDate;
            if (birthDateObj instanceof java.time.LocalDate ld) {
                birthDate = ld;
            } else {
                birthDate = java.time.LocalDate.parse(birthDateObj.toString().substring(0, 10));
            }
            java.time.LocalDate today = java.time.LocalDate.now();
            return java.time.Period.between(birthDate, today).getYears();
        } catch (Exception e) {
            log.warn("Failed to parse birthDate for AGE function: {}", birthDateObj);
            return null;
        }
    }

    private BigDecimal evaluateSum(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] argRefs = splitArgs(argsStr);
        BigDecimal sum = BigDecimal.ZERO;
        for (String argRef : argRefs) {
            Object value = resolveArgument(argRef, currentAnswers);
            if (value != null) {
                sum = sum.add(toBigDecimal(value));
            }
        }
        return sum;
    }

    private BigDecimal evaluateAvg(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] argRefs = splitArgs(argsStr);
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        for (String argRef : argRefs) {
            Object value = resolveArgument(argRef, currentAnswers);
            if (value != null) {
                sum = sum.add(toBigDecimal(value));
                count++;
            }
        }
        return count > 0 ? sum.divide(BigDecimal.valueOf(count), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
    }

    private BigDecimal evaluateMin(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] argRefs = splitArgs(argsStr);
        BigDecimal min = null;
        for (String argRef : argRefs) {
            Object value = resolveArgument(argRef, currentAnswers);
            if (value != null) {
                BigDecimal num = toBigDecimal(value);
                if (min == null || num.compareTo(min) < 0) {
                    min = num;
                }
            }
        }
        return min != null ? min : BigDecimal.ZERO;
    }

    private BigDecimal evaluateMax(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] argRefs = splitArgs(argsStr);
        BigDecimal max = null;
        for (String argRef : argRefs) {
            Object value = resolveArgument(argRef, currentAnswers);
            if (value != null) {
                BigDecimal num = toBigDecimal(value);
                if (max == null || num.compareTo(max) > 0) {
                    max = num;
                }
            }
        }
        return max != null ? max : BigDecimal.ZERO;
    }

    private Object evaluateIf(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] parts = splitArgs(argsStr, 3);
        if (parts.length < 3) {
            return null;
        }
        boolean condition = evaluateCondition(parts[0], currentAnswers);
        return condition ? resolveArgument(parts[1], currentAnswers) : resolveArgument(parts[2], currentAnswers);
    }

    private int evaluateCount(String argsStr, Map<UUID, Object> currentAnswers) {
        String[] argRefs = splitArgs(argsStr);
        int count = 0;
        for (String argRef : argRefs) {
            Object value = resolveArgument(argRef, currentAnswers);
            if (value != null && !value.toString().isBlank()) {
                count++;
            }
        }
        return count;
    }

    private String[] splitArgs(String argsStr) {
        return splitArgs(argsStr, -1);
    }

    private String[] splitArgs(String argsStr, int expectedCount) {
        java.util.List<String> parts = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        int depth = 0;

        for (char c : argsStr.toCharArray()) {
            if (c == '(') {
                depth++;
            } else if (c == ')') {
                depth--;
            }
            if (c == ',' && depth == 0) {
                parts.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        if (!current.isEmpty()) {
            parts.add(current.toString().trim());
        }

        return parts.toArray(new String[0]);
    }

    private boolean evaluateCondition(String conditionStr, Map<UUID, Object> currentAnswers) {
        // Parse "field operator value" format
        String[] parts = conditionStr.split("\\s+", 3);
        if (parts.length < 3) {
            return false;
        }
        Object actual = resolveArgument(parts[0], currentAnswers);
        Object expected = resolveArgument(parts[2], currentAnswers);
        return applyOperator(actual, expected, parts[1]);
    }

    // ========== UTILITY METHODS ==========

    public Object resolveArgument(String argRef, Map<UUID, Object> currentAnswers) {
        if (argRef == null) return null;
        argRef = argRef.trim();

        // {{uuid}} format (new)
        if (argRef.startsWith("{{") && argRef.endsWith("}}")) {
            String uuidStr = argRef.substring(2, argRef.length() - 2);
            return currentAnswers.get(UUID.fromString(uuidStr));
        }

        // $uuid (legacy)
        if (argRef.startsWith("$")) {
            String uuidStr = argRef.substring(1);
            return currentAnswers.get(UUID.fromString(uuidStr));
        }

        // {question:uuid} (legacy)
        if (argRef.startsWith("{question:") && argRef.endsWith("}")) {
            String uuidStr = argRef.substring(10, argRef.length() - 1);
            return currentAnswers.get(UUID.fromString(uuidStr));
        }

        // Literal values
        if (argRef.startsWith("\"") && argRef.endsWith("\"")) {
            return argRef.substring(1, argRef.length() - 1);
        }
        if (argRef.equals("true")) return true;
        if (argRef.equals("false")) return false;
        if (argRef.equals("null") || argRef.isEmpty()) return null;

        try {
            return new BigDecimal(argRef);
        } catch (NumberFormatException e) {
            return argRef;
        }
    }

    public boolean applyOperator(Object actualValue, Object expectedValue, String operator) {
        if (actualValue == null) {
            return "isNull".equals(operator) || "isEmpty".equals(operator);
        }

        return switch (operator) {
            case "equals", "==" -> Objects.equals(actualValue, expectedValue);
            case "notEquals", "!=" -> !Objects.equals(actualValue, expectedValue);
            case "contains" -> actualValue.toString().contains(expectedValue.toString());
            case "greaterThan", ">" -> compareNumbers(actualValue, expectedValue) > 0;
            case "lessThan", "<" -> compareNumbers(actualValue, expectedValue) < 0;
            case "greaterOrEqual", ">=" -> compareNumbers(actualValue, expectedValue) >= 0;
            case "lessOrEqual", "<=" -> compareNumbers(actualValue, expectedValue) <= 0;
            case "isEmpty" -> actualValue == null || actualValue.toString().isBlank();
            case "isNotEmpty" -> actualValue != null && !actualValue.toString().isBlank();
            case "isTrue" -> Boolean.TRUE.equals(actualValue);
            case "isFalse" -> Boolean.FALSE.equals(actualValue);
            default -> Objects.equals(actualValue, expectedValue);
        };
    }

    private int compareNumbers(Object actualValue, Object expectedValue) {
        BigDecimal actual = toBigDecimal(actualValue);
        BigDecimal expected = toBigDecimal(expectedValue);
        return actual.compareTo(expected);
    }

    public BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bd) {
            return bd;
        }
        if (value instanceof Number num) {
            return BigDecimal.valueOf(num.doubleValue());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
