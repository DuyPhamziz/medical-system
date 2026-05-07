package com.healthcare.repository;

import com.healthcare.entity.FamilyMember;
import com.healthcare.entity.FamilyMemberDisease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FamilyMemberDiseaseRepository extends JpaRepository<FamilyMemberDisease, UUID> {
    Optional<List<FamilyMemberDisease>> findByFamilyMember(FamilyMember member);
}
