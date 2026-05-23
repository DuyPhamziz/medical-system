package com.healthcare.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Stack;

/**
 * Calculation engine for evaluating mathematical formulas.
 * Supports: +, -, *, /, %, (), variables {{questionId}}
 * 
 * Example: "{{q1}} + {{q2}} * 2 / {{q3}}"
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormCalculationEngine {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");

    /**
     * Evaluate a formula with given answer values
     *
     * @param formula formula string with {{variableId}} placeholders
     * @param answerValues map of questionId -> numeric value
     * @return calculated result, or null if evaluation fails
     */
    public BigDecimal evaluateFormula(String formula, Map<String, Object> answerValues) {
        try {
            String evaluatedFormula = replaceVariables(formula, answerValues);
            return evaluateExpression(evaluatedFormula);
        } catch (Exception e) {
            log.warn("Error evaluating formula: {}", formula, e);
            return null;
        }
    }

    /**
     * Replace {{questionId}} with numeric values
     */
    private String replaceVariables(String formula, Map<String, Object> answerValues) {
        StringBuffer sb = new StringBuffer();
        Matcher matcher = VARIABLE_PATTERN.matcher(formula);

        while (matcher.find()) {
            String questionId = matcher.group(1);
            Object value = answerValues.get(questionId);

            if (value == null) {
                // Keep placeholder for missing values so the caller can detect
                matcher.appendReplacement(sb, "0");
                log.warn("Missing answer for question {} in formula, defaulting to 0", questionId);
            } else {
                double numValue = toDouble(value);
                matcher.appendReplacement(sb, String.valueOf(numValue));
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    /**
     * Evaluate mathematical expression using operator precedence
     * Supports: +, -, *, /, %
     */
    private BigDecimal evaluateExpression(String expression) {
        // Remove spaces
        expression = expression.replaceAll("\\s+", "");
        
        // Tokenize and evaluate
        return evaluateTokens(tokenize(expression));
    }

    /**
     * Tokenize expression into numbers and operators
     */
    private java.util.List<String> tokenize(String expression) {
        java.util.List<String> tokens = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        
        for (int i = 0; i < expression.length(); i++) {
            char ch = expression.charAt(i);
            
            // Handle unary minus: if '-' appears at start or after '(' or another operator, it's a sign
            if (ch == '-' && (i == 0 || expression.charAt(i - 1) == '(' || "+-*/%".indexOf(expression.charAt(i - 1)) >= 0)) {
                current.append(ch);
            } else if (Character.isDigit(ch) || ch == '.') {
                current.append(ch);
            } else if (ch == '(' || ch == ')' || "+-*/%".indexOf(ch) >= 0) {
                if (current.length() > 0) {
                    tokens.add(current.toString());
                    current = new StringBuilder();
                }
                tokens.add(String.valueOf(ch));
            }
        }
        
        if (current.length() > 0) {
            tokens.add(current.toString());
        }
        
        return tokens;
    }

    /**
     * Evaluate tokens respecting operator precedence using Shunting Yard algorithm
     */
    private BigDecimal evaluateTokens(java.util.List<String> tokens) {
        Stack<BigDecimal> operands = new Stack<>();
        Stack<String> operators = new Stack<>();
        
        for (String token : tokens) {
            if (isNumber(token)) {
                operands.push(new BigDecimal(token));
            } else if ("+-*/%".contains(token)) {
                while (!operators.isEmpty() && 
                       hasPrecedence(operators.peek(), token)) {
                    operands.push(applyOperator(
                        operators.pop(),
                        operands.pop(),
                        operands.pop()
                    ));
                }
                operators.push(token);
            } else if (token.equals("(")) {
                operators.push(token);
            } else if (token.equals(")")) {
                while (!operators.isEmpty() && !operators.peek().equals("(")) {
                    operands.push(applyOperator(
                        operators.pop(),
                        operands.pop(),
                        operands.pop()
                    ));
                }
                if (!operators.isEmpty()) {
                    operators.pop(); // Remove '('
                }
            }
        }
        
        while (!operators.isEmpty()) {
            operands.push(applyOperator(
                operators.pop(),
                operands.pop(),
                operands.pop()
            ));
        }
        
        return operands.isEmpty() ? BigDecimal.ZERO : operands.peek();
    }

    /**
     * Check if operator has precedence
     */
    private boolean hasPrecedence(String op1, String op2) {
        if ("(".equals(op1)) {
            return false;
        }
        if (("+".equals(op1) || "-".equals(op1)) &&
            ("*".equals(op2) || "/".equals(op2) || "%".equals(op2))) {
            return false;
        }
        return true;
    }

    /**
     * Apply operator to two operands
     * Note: order matters for - and /
     */
    private BigDecimal applyOperator(String operator, BigDecimal b, BigDecimal a) {
        return switch (operator) {
            case "+" -> a.add(b);
            case "-" -> a.subtract(b);
            case "*" -> a.multiply(b);
            case "/" -> a.divide(b, 10, RoundingMode.HALF_UP);
            case "%" -> a.remainder(b);
            default -> BigDecimal.ZERO;
        };
    }

    /**
     * Check if token is a number
     */
    private boolean isNumber(String token) {
        try {
            Double.parseDouble(token);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Convert object to double
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
     * Batch evaluate formulas for multiple rows/answers
     */
    public Map<String, BigDecimal> evaluateFormulaBatch(
            String formula,
            java.util.List<Map<String, Object>> answerValuesList) {
        Map<String, BigDecimal> results = new HashMap<>();
        
        for (int i = 0; i < answerValuesList.size(); i++) {
            BigDecimal result = evaluateFormula(formula, answerValuesList.get(i));
            results.put("result_" + i, result);
        }
        
        return results;
    }
}
