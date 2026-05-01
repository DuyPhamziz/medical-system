package com.healthcare.service;

import com.healthcare.dto.FormListItemResponse;
import com.healthcare.dto.FormResponse;
import com.healthcare.dto.FormUpsertRequest;
import com.healthcare.entity.*;
import com.healthcare.entity.enums.FormVisibility;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class FormMapper {

    public FormResponse toResponse(Form form) {
        return FormResponse.builder()
                .formId(form.getFormId())
                .title(form.getTitle())
                .description(form.getDescription())
                .template(form.isTemplate())
                .publicForm(form.isPublicForm())
                .status(form.getStatus())
                .visibility(form.getVisibility() == null ? "DOCTOR_ONLY" : form.getVisibility().name())
                .paid(form.isPaid())
                .price(form.getPrice())
                .version(form.getVersion())
                .publishedAt(form.getPublishedAt())
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .createdById(form.getCreatedBy() == null ? null : form.getCreatedBy().getUserId())
                .createdByName(form.getCreatedBy() == null ? null : form.getCreatedBy().getUsername())
                .sections(form.getSections().stream().map(this::toSectionResponse).toList())
                .build();
    }

    public FormResponse.SectionResponse toSectionResponse(FormSection s) {
        return FormResponse.SectionResponse.builder()
                .sectionId(s.getSectionId())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .allowRepeat(s.isAllowRepeat())
                .repeatLabel(s.getRepeatLabel())
                .questions(s.getQuestions().stream().map(this::toQuestionResponse).toList())
                .build();
    }

    public FormResponse.QuestionResponse toQuestionResponse(FormQuestion q) {
        return FormResponse.QuestionResponse.builder()
                .questionId(q.getQuestionId())
                .content(q.getContent())
                .questionType(q.getQuestionType())
                .required(q.isRequired())
                .allowRepeat(q.isAllowRepeat())
                .orderIndex(q.getOrderIndex())
                .minValue(q.getMinValue())
                .maxValue(q.getMaxValue())
                .minLength(q.getMinLength())
                .maxLength(q.getMaxLength())
                .validationPattern(q.getValidationPattern())
                .validationMessage(q.getValidationMessage())
                .placeholder(q.getPlaceholder())
                .helperText(q.getHelperText())
                .scaleMin(q.getScaleMin())
                .scaleMax(q.getScaleMax())
                .triggerLogic(q.getTriggerLogic())
                .configJson(q.getConfigJson())
                .scaleId(q.getClinicalScale() != null ? q.getClinicalScale().getScaleId() : null)
                .options(q.getOptions().stream().map(this::toOptionResponse).toList())
                .build();
    }

    public FormResponse.OptionResponse toOptionResponse(FormQuestionOption o) {
        return FormResponse.OptionResponse.builder()
                .optionId(o.getOptionId())
                .content(o.getContent())
                .score(o.getScore())
                .orderIndex(o.getOrderIndex())
                .triggerLogic(o.getTriggerLogic())
                .build();
    }

    public FormListItemResponse toListItem(Form f) {
        return FormListItemResponse.builder()
                .formId(f.getFormId())
                .title(f.getTitle())
                .description(f.getDescription())
                .template(f.isTemplate())
                .publicForm(f.isPublicForm())
                .paid(f.isPaid())
                .price(f.getPrice())
                .status(f.getStatus().name())
                .updatedAt(f.getUpdatedAt())
                .sectionCount(f.getSections() == null ? 0 : f.getSections().size())
                .build();
    }

    public void applyStructure(Form form, FormUpsertRequest request) {
        // We use a Map to keep track of existing sections to reuse them
        Map<UUID, FormSection> existingSections = new HashMap<>();
        if (form.getSections() != null) {
            form.getSections().forEach(s -> {
                if (s.getSectionId() != null) existingSections.put(s.getSectionId(), s);
            });
        } else {
            form.setSections(new ArrayList<>());
        }

        List<FormSection> updatedSections = new ArrayList<>();
        int sIdx = 0;
        for (var sReq : request.getSections()) {
            UUID sid = safeUuid(sReq.getSectionId());
            FormSection section = (sid != null && existingSections.containsKey(sid)) ? existingSections.get(sid) : new FormSection();
            
            section.setForm(form);
            section.setTitle(sReq.getTitle());
            section.setDescription(sReq.getDescription());
            section.setAllowRepeat(sReq.isAllowRepeat());
            section.setRepeatLabel(sReq.getRepeatLabel());
            section.setOrderIndex(sIdx++);

            Map<UUID, FormQuestion> existingQuestions = new HashMap<>();
            if (section.getQuestions() != null) {
                section.getQuestions().forEach(q -> {
                    if (q.getQuestionId() != null) existingQuestions.put(q.getQuestionId(), q);
                });
            } else {
                section.setQuestions(new ArrayList<>());
            }

            List<FormQuestion> updatedQuestions = new ArrayList<>();
            int qIdx = 0;
            for (var qReq : sReq.getQuestions()) {
                UUID qid = safeUuid(qReq.getQuestionId());
                FormQuestion q = (qid != null && existingQuestions.containsKey(qid)) ? existingQuestions.get(qid) : new FormQuestion();

                q.setSection(section);
                q.setContent(qReq.getContent());
                q.setQuestionType(qReq.getQuestionType());
                q.setRequired(qReq.isRequired());
                q.setAllowRepeat(qReq.isAllowRepeat());
                q.setOrderIndex(qIdx++);
                q.setMinValue(qReq.getMinValue());
                q.setMaxValue(qReq.getMaxValue());
                q.setMinLength(qReq.getMinLength());
                q.setMaxLength(qReq.getMaxLength());
                q.setValidationPattern(qReq.getValidationPattern());
                q.setValidationMessage(qReq.getValidationMessage());
                q.setPlaceholder(qReq.getPlaceholder());
                q.setHelperText(qReq.getHelperText());
                q.setScaleMin(qReq.getScaleMin());
                q.setScaleMax(qReq.getScaleMax());
                q.setTriggerLogic(qReq.getTriggerLogic());
                q.setConfigJson(qReq.getConfigJson());

                Map<UUID, FormQuestionOption> existingOptions = new HashMap<>();
                if (q.getOptions() != null) {
                    q.getOptions().forEach(o -> {
                        if (o.getOptionId() != null) existingOptions.put(o.getOptionId(), o);
                    });
                } else {
                    q.setOptions(new ArrayList<>());
                }

                List<FormQuestionOption> updatedOptions = new ArrayList<>();
                int oIdx = 0;
                for (var oReq : qReq.getOptions()) {
                    UUID oid = safeUuid(oReq.getOptionId());
                    FormQuestionOption o = (oid != null && existingOptions.containsKey(oid)) ? existingOptions.get(oid) : new FormQuestionOption();

                    o.setQuestion(q);
                    o.setContent(oReq.getContent());
                    o.setScore(oReq.getScore());
                    o.setOrderIndex(oIdx++);
                    o.setTriggerLogic(oReq.getTriggerLogic());
                    updatedOptions.add(o);
                }
                
                if (q.getOptions() == null) q.setOptions(new ArrayList<>());
                q.getOptions().clear();
                q.getOptions().addAll(updatedOptions);
                updatedQuestions.add(q);
            }
            
            if (section.getQuestions() == null) section.setQuestions(new ArrayList<>());
            section.getQuestions().clear();
            section.getQuestions().addAll(updatedQuestions);
            updatedSections.add(section);
        }
        
        if (form.getSections() == null) form.setSections(new ArrayList<>());
        form.getSections().clear();
        form.getSections().addAll(updatedSections);
    }

    private UUID safeUuid(String id) {
        if (id == null || id.isEmpty() || id.equals("null") || id.equals("undefined")) return null;
        try { return UUID.fromString(id); } catch (Exception e) { return null; }
    }

    public com.healthcare.dto.PatientFormResponse toPatientFormResponse(AnswerSession s) {
        return com.healthcare.dto.PatientFormResponse.builder()
                .sessionId(s.getSessionId())
                .formId(s.getForm().getFormId())
                .formTitle(s.getForm().getTitle())
                .formStatus(s.getForm().getStatus())
                .status(s.getStatus())
                .startedAt(s.getStartedAt())
                .submittedAt(s.getSubmittedAt())
                .totalScore(s.getTotalScore())
                .answerCount(s.getAnswers() != null ? s.getAnswers().size() : 0)
                .build();
    }

    public FormVisibility parseVisibility(String v) {
        try { return FormVisibility.valueOf(v); } catch (Exception e) { return FormVisibility.DOCTOR_ONLY; }
    }
}
