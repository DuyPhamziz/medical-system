package com.healthcare.repository;

import com.healthcare.entity.FamilyRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FamilyRelationshipRepository extends JpaRepository<FamilyRelationship, UUID> {
}
