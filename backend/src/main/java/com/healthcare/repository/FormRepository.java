package com.healthcare.repository;

import com.healthcare.entity.Form;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.enums.FormVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FormRepository extends JpaRepository<Form, UUID> {
    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.status = :status AND f.publicForm = true ORDER BY f.updatedAt DESC")
    List<Form> findByStatusAndPublicFormTrueOrderByUpdatedAtDesc(@Param("status") FormStatus status);

    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.status = :status AND f.publicForm = true AND f.visibility = :visibility ORDER BY f.updatedAt DESC")
    List<Form> findByStatusAndPublicFormTrueAndVisibilityOrderByUpdatedAtDesc(@Param("status") FormStatus status, @Param("visibility") FormVisibility visibility);

    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy ORDER BY f.updatedAt DESC")
    List<Form> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.createdBy.userId = :userId ORDER BY f.updatedAt DESC")
    List<Form> findAllByCreatedBy_UserIdOrderByUpdatedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.template = true AND f.createdBy.userId = :userId ORDER BY f.updatedAt DESC")
    List<Form> findByTemplateTrueAndCreatedBy_UserIdOrderByUpdatedAtDesc(@Param("userId") UUID userId);

    // Find templates NOT owned by a specific user (e.g., system templates accessible to all doctors)
    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.template = true AND f.createdBy.userId != :userId ORDER BY f.updatedAt DESC")
    List<Form> findByTemplateTrueAndCreatedBy_UserIdNotOrderByUpdatedAtDesc(@Param("userId") UUID userId);

    // Find ALL templates (for listing accessible templates)
    @Query("SELECT f FROM Form f JOIN FETCH f.createdBy WHERE f.template = true ORDER BY f.updatedAt DESC")
    List<Form> findByTemplateTrueOrderByUpdatedAtDesc();
}