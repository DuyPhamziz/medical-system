package com.healthcare.repository;

import com.healthcare.entity.OrgSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrgSubscriptionRepository extends JpaRepository<OrgSubscription, UUID> {

    List<OrgSubscription> findByOrganization_OrgIdOrderByCreatedAtDesc(UUID orgId);

    List<OrgSubscription> findByOrganization_OrgIdAndIsActiveTrue(UUID orgId);
}
