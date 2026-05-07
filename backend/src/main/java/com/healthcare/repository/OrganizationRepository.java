package com.healthcare.repository;

import com.healthcare.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findByNameIgnoreCase(String name);

    List<Organization> findByIsActiveTrue();

    List<Organization> findBySubscriptionPlan(String subscriptionPlan);

    long countByIsActiveTrue();
}
