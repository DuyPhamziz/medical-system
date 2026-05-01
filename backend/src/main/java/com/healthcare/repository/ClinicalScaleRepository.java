package com.healthcare.repository;

import com.healthcare.entity.ClinicalScale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClinicalScaleRepository extends JpaRepository<ClinicalScale, UUID> {

    /**
     * Find scale by name (case-insensitive)
     */
    Optional<ClinicalScale> findByNameIgnoreCase(String name);

    /**
     * Find all active scales by category
     */
    List<ClinicalScale> findByIsActiveTrueAndCategory(String category);

    /**
     * Find all active scales
     */
    List<ClinicalScale> findByIsActiveTrue();

    /**
     * Find by name or scale ID
     */
    Optional<ClinicalScale> findByScaleIdOrNameIgnoreCase(UUID scaleId, String name);
}
