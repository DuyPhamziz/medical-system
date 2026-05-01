package com.healthcare.repository;

import com.healthcare.entity.FamilyMemberDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FamilyMemberDiseaseRepository extends JpaRepository<FamilyMemberDisease, UUID> {
}
