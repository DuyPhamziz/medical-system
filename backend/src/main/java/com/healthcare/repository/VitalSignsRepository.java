package com.healthcare.repository;

import com.healthcare.entity.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, UUID> {
    List<VitalSigns> findByPatient_PatientIdOrderByRecordedAtDesc(UUID patientId);
}
