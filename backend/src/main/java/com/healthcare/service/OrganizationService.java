package com.healthcare.service;

import com.healthcare.entity.Organization;
import com.healthcare.entity.OrgFeatureFlag;
import com.healthcare.entity.OrgSubscription;
import com.healthcare.repository.OrgFeatureFlagRepository;
import com.healthcare.repository.OrgSubscriptionRepository;
import com.healthcare.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrgSubscriptionRepository subscriptionRepository;
    private final OrgFeatureFlagRepository featureFlagRepository;

    // ============================================================
    // Organization CRUD
    // ============================================================

    @Cacheable(value = "organizations")
    @Transactional(readOnly = true)
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Cacheable(value = "organizations", key = "#orgId")
    @Transactional(readOnly = true)
    public Organization getOrganization(UUID orgId) {
        return organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + orgId));
    }

    @Transactional
    public Organization createOrganization(String name, String type, String email, String phone, String address) {
        Organization org = Organization.builder()
                .name(name)
                .type(type)
                .email(email)
                .phone(phone)
                .address(address)
                .subscriptionPlan("FREE")
                .isActive(true)
                .build();
        var saved = organizationRepository.save(org);
        log.info("Created organization: {} (ID: {})", name, saved.getOrgId());

        // Create initial subscription record
        OrgSubscription sub = OrgSubscription.builder()
                .organization(saved)
                .planType("FREE")
                .startedAt(LocalDateTime.now())
                .isActive(true)
                .notes("Initial free plan")
                .build();
        subscriptionRepository.save(sub);

        return saved;
    }

    @CacheEvict(value = "organizations", key = "#orgId")
    @Transactional
    public Organization updateOrganization(UUID orgId, String name, String type, String email,
                                            String phone, String address) {
        Organization org = getOrganization(orgId);
        if (name != null) org.setName(name);
        if (type != null) org.setType(type);
        if (email != null) org.setEmail(email);
        if (phone != null) org.setPhone(phone);
        if (address != null) org.setAddress(address);
        return organizationRepository.save(org);
    }

    @CacheEvict(value = "organizations", key = "#orgId")
    @Transactional
    public void deactivateOrganization(UUID orgId) {
        Organization org = getOrganization(orgId);
        org.setIsActive(false);
        organizationRepository.save(org);
        log.info("Deactivated organization: {} (ID: {})", org.getName(), orgId);
    }

    @CacheEvict(value = "organizations", key = "#orgId")
    @Transactional
    public void activateOrganization(UUID orgId) {
        Organization org = getOrganization(orgId);
        org.setIsActive(true);
        organizationRepository.save(org);
        log.info("Activated organization: {} (ID: {})", org.getName(), orgId);
    }

    // ============================================================
    // Subscription management
    // ============================================================

    @Transactional(readOnly = true)
    public List<OrgSubscription> getSubscriptionHistory(UUID orgId) {
        return subscriptionRepository.findByOrganization_OrgIdOrderByCreatedAtDesc(orgId);
    }

    @Transactional(readOnly = true)
    public OrgSubscription getActiveSubscription(UUID orgId) {
        List<OrgSubscription> active = subscriptionRepository
                .findByOrganization_OrgIdAndIsActiveTrue(orgId);
        return active.isEmpty() ? null : active.getFirst();
    }

    @Transactional
    public OrgSubscription upgradeSubscription(UUID orgId, String planType, int durationMonths) {
        Organization org = getOrganization(orgId);

        // Deactivate current subscriptions
        List<OrgSubscription> active = subscriptionRepository
                .findByOrganization_OrgIdAndIsActiveTrue(orgId);
        active.forEach(sub -> sub.setIsActive(false));
        subscriptionRepository.saveAll(active);

        // Create new subscription
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = durationMonths > 0
                ? now.plusMonths(durationMonths) : null;

        OrgSubscription sub = OrgSubscription.builder()
                .organization(org)
                .planType(planType)
                .startedAt(now)
                .expiresAt(expiresAt)
                .isActive(true)
                .build();
        var saved = subscriptionRepository.save(sub);

        // Update org plan
        org.setSubscriptionPlan(planType);
        org.setSubscriptionExpiry(expiresAt);
        organizationRepository.save(org);

        log.info("Upgraded org {} to plan {} ({} months)", orgId, planType, durationMonths);
        return saved;
    }

    // ============================================================
    // Feature flags
    // ============================================================

    @Transactional(readOnly = true)
    public List<OrgFeatureFlag> getFeatureFlags(UUID orgId) {
        return featureFlagRepository.findByOrganization_OrgId(orgId);
    }

    @Transactional(readOnly = true)
    public boolean isFeatureEnabled(UUID orgId, String featureKey) {
        return featureFlagRepository.existsByOrganization_OrgIdAndFeatureKeyAndIsEnabledTrue(orgId, featureKey);
    }

    @Transactional
    public void setFeatureFlag(UUID orgId, String featureKey, boolean enabled, String configJson) {
        var existing = featureFlagRepository.findByOrganization_OrgIdAndFeatureKey(orgId, featureKey);
        OrgFeatureFlag flag;
        if (existing.isPresent()) {
            flag = existing.get();
            flag.setIsEnabled(enabled);
            if (configJson != null) flag.setConfigJson(configJson);
        } else {
            Organization org = getOrganization(orgId);
            flag = OrgFeatureFlag.builder()
                    .organization(org)
                    .featureKey(featureKey)
                    .isEnabled(enabled)
                    .configJson(configJson)
                    .build();
        }
        featureFlagRepository.save(flag);
        log.info("Feature '{}' for org {} set to {}", featureKey, orgId, enabled);
    }
}
