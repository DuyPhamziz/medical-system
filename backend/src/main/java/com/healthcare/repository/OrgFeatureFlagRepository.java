package com.healthcare.repository;

import com.healthcare.entity.OrgFeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrgFeatureFlagRepository extends JpaRepository<OrgFeatureFlag, UUID> {

    List<OrgFeatureFlag> findByOrganization_OrgId(UUID orgId);

    Optional<OrgFeatureFlag> findByOrganization_OrgIdAndFeatureKey(UUID orgId, String featureKey);

    boolean existsByOrganization_OrgIdAndFeatureKeyAndIsEnabledTrue(UUID orgId, String featureKey);
}
