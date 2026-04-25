package com.healthcare.repository;

import com.healthcare.entity.AnswerSession;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerSessionRepository extends JpaRepository<AnswerSession, UUID> {
    @EntityGraph(attributePaths = {"form", "form.sections", "form.sections.questions", "form.sections.questions.options", "patient", "answers", "answers.question", "answers.option"})
    Optional<AnswerSession> findWithGraphBySessionId(UUID sessionId);

    @EntityGraph(attributePaths = {"form", "form.sections", "form.sections.questions", "form.sections.questions.options", "patient", "answers", "answers.question", "answers.option"})
    List<AnswerSession> findByPatient_PatientIdOrderByLastSavedAtDesc(UUID patientId);
}