package com.healthcare.repository;

import com.healthcare.entity.Visit;
import com.healthcare.entity.enums.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitRepository extends JpaRepository<Visit, UUID> {
    List<Visit> findByPatient_PatientIdOrderByVisitDateDesc(UUID patientId);

    List<Visit> findByDoctor_UserIdOrderByVisitDateDesc(UUID doctorId);

    List<Visit> findByDoctor_UserIdAndStatusOrderByVisitDateDesc(UUID doctorId, VisitStatus status);

    List<Visit> findByStatusAndDoctor_UserIdOrderByVisitDateDesc(VisitStatus status, UUID doctorId);

    List<Visit> findByStatusOrderByVisitDateDesc(VisitStatus status);

    long countByStatus(VisitStatus status);
}
