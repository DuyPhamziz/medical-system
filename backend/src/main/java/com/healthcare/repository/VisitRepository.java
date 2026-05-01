package com.healthcare.repository;

import com.healthcare.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    List<Visit> findByPatient_PatientIdOrderByVisitDateDesc(UUID patientId);
}
