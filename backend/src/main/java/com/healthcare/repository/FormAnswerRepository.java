package com.healthcare.repository;

import com.healthcare.entity.FormAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormAnswerRepository extends JpaRepository<FormAnswer, UUID> {
    List<FormAnswer> findBySession_SessionId(UUID sessionId);

    void deleteBySession_SessionId(UUID sessionId);
}