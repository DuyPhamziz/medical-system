package com.healthcare.repository;

import com.healthcare.entity.Form;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.enums.FormVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormRepository extends JpaRepository<Form, UUID> {
    List<Form> findByStatusAndPublicFormTrueOrderByUpdatedAtDesc(FormStatus status);

    List<Form> findByStatusAndPublicFormTrueAndVisibilityOrderByUpdatedAtDesc(FormStatus status, FormVisibility visibility);

    List<Form> findAllByOrderByUpdatedAtDesc();

    List<Form> findAllByCreatedBy_UserIdOrderByUpdatedAtDesc(UUID userId);

    List<Form> findByTemplateTrueAndCreatedBy_UserIdOrderByUpdatedAtDesc(UUID userId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"createdBy"})
    java.util.Optional<Form> findWithGraphByFormId(UUID formId);
}