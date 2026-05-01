package com.healthcare.repository;

import com.healthcare.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
    java.util.Optional<FamilyMember> findByPatient_PatientId(UUID patientId);
}
