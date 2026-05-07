package com.healthcare.service;

import com.healthcare.dto.AnswerSubmissionRequest;
import com.healthcare.entity.Form;
import com.healthcare.entity.FormQuestion;
import com.healthcare.entity.QuestionType;
import com.healthcare.service.engine.FormEngine;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FormSubmissionValidator {
    private final FormEngine formEngine;
    private final ObjectMapper objectMapper;

    public void validateRequiredAnswers(Form form, List<AnswerSubmissionRequest.AnswerItem> answers) {
        Map<UUID, Object> currentAnswers = new HashMap<>();
        for (AnswerSubmissionRequest.AnswerItem item : answers) {
            currentAnswers.put(item.getQuestionId(), extractAnswerValue(item));
        }

        FormEngine.FormState formState = formEngine.evaluateFormState(form, currentAnswers);
        Map<UUID, List<AnswerSubmissionRequest.AnswerItem>> answersByQuestion = answers.stream()
                .collect(Collectors.groupingBy(AnswerSubmissionRequest.AnswerItem::getQuestionId));

        for (FormEngine.FormState.SectionState sectionState : formState.getSections()) {
            for (FormEngine.FormState.QuestionState questionState : sectionState.getQuestions()) {
                if (!questionState.isEffectiveRequired()) continue;

                List<AnswerSubmissionRequest.AnswerItem> questionAnswers = answersByQuestion.get(questionState.getQuestionId());
                FormQuestion question = findQuestion(form, questionState.getQuestionId());
                
                if (questionAnswers == null || questionAnswers.isEmpty()) {
                    throw new IllegalArgumentException("Required question is missing answer: " + questionState.getContent());
                }

                boolean valid = questionAnswers.stream().anyMatch(a -> isAnswerValid(a, question.getQuestionType()));
                if (!valid) {
                    throw new IllegalArgumentException("Required question has no valid answer: " + questionState.getContent());
                }
            }
        }
    }

    private FormQuestion findQuestion(Form form, UUID questionId) {
        return form.getSections().stream()
                .flatMap(section -> section.getQuestions().stream())
                .filter(question -> question.getQuestionId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
    }

    private Object extractAnswerValue(AnswerSubmissionRequest.AnswerItem item) {
        if (item.getValueJson() != null && !item.getValueJson().isBlank()) {
            try { return objectMapper.readTree(item.getValueJson()); } catch (Exception e) { return item.getValueJson(); }
        }
        if (item.getValueText() != null) return item.getValueText();
        if (item.getValueNumber() != null) return item.getValueNumber();
        if (item.getValueDate() != null) return item.getValueDate();
        if (item.getValueBoolean() != null) return item.getValueBoolean();
        return null;
    }

    private boolean isAnswerValid(AnswerSubmissionRequest.AnswerItem answer, QuestionType questionType) {
        switch (questionType) {
            case TEXT: return answer.getValueText() != null && !answer.getValueText().trim().isEmpty();
            case NUMBER:
            case SCALE: return answer.getValueNumber() != null;
            case DATE: return answer.getValueDate() != null;
            case SINGLE_CHOICE: return answer.getOptionId() != null;
            case MULTIPLE_CHOICE:
            case MATRIX:
            case PEDIGREE:
            case BODY_MAP:
            case FILE_UPLOAD:
            case LOOKUP:
            case TIME_SERIES:
                return answer.getValueJson() != null && !answer.getValueJson().isEmpty();
            case CALCULATED:
                return true;
            default: return false;
        }
    }
}
