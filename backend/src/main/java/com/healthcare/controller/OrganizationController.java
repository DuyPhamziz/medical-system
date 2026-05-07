package com.healthcare.controller;

import com.healthcare.dto.*;
import com.healthcare.entity.Organization;
import com.healthcare.entity.OrgFeatureFlag;
import com.healthcare.entity.OrgSubscription;
import com.healthcare.repository.OrganizationRepository;
import com.healthcare.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orgs")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationRepository organizationRepository;

    // ============================================================
    // Organization CRUD
    // ============================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizationResponse>> getAllOrganizations() {
        var orgs = organizationService.getAllOrganizations();
        var responses = orgs.stream()
                .map(org -> OrganizationResponse.fromEntity(org, 0))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{orgId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrgDetailResponse> getOrganizationDetail(@PathVariable UUID orgId) {
        var org = organizationService.getOrganization(orgId);
        var activeSub = organizationService.getActiveSubscription(orgId);
        var subHistory = organizationService.getSubscriptionHistory(orgId);
        var flags = organizationService.getFeatureFlags(orgId);

        var response = OrgDetailResponse.builder()
                .organization(OrganizationResponse.fromEntity(org, 0))
                .activeSubscription(activeSub != null ? SubscriptionResponse.fromEntity(activeSub) : null)
                .subscriptionHistory(subHistory.stream().map(SubscriptionResponse::fromEntity).toList())
                .featureFlags(flags.stream().map(FeatureFlagResponse::fromEntity).toList())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizationResponse> createOrganization(@RequestBody CreateOrgRequest request) {
        var org = organizationService.createOrganization(
                request.getName(),
                request.getType(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );
        return ResponseEntity.ok(OrganizationResponse.fromEntity(org, 0));
    }

    @PutMapping("/{orgId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable UUID orgId,
            @RequestBody CreateOrgRequest request) {
        var org = organizationService.updateOrganization(
                orgId, request.getName(), request.getType(),
                request.getEmail(), request.getPhone(), request.getAddress());
        return ResponseEntity.ok(OrganizationResponse.fromEntity(org, 0));
    }

    @PostMapping("/{orgId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateOrganization(@PathVariable UUID orgId) {
        organizationService.deactivateOrganization(orgId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orgId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateOrganization(@PathVariable UUID orgId) {
        organizationService.activateOrganization(orgId);
        return ResponseEntity.ok().build();
    }

    // ============================================================
    // Subscription management
    // ============================================================

    @GetMapping("/{orgId}/subscriptions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptionHistory(@PathVariable UUID orgId) {
        var history = organizationService.getSubscriptionHistory(orgId);
        return ResponseEntity.ok(history.stream().map(SubscriptionResponse::fromEntity).toList());
    }

    @PostMapping("/{orgId}/subscriptions/upgrade")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubscriptionResponse> upgradeSubscription(
            @PathVariable UUID orgId,
            @RequestBody UpgradeSubscriptionRequest request) {
        var sub = organizationService.upgradeSubscription(orgId, request.getPlanType(), request.getDurationMonths());
        return ResponseEntity.ok(SubscriptionResponse.fromEntity(sub));
    }

    // ============================================================
    // Feature flags
    // ============================================================

    @GetMapping("/{orgId}/features")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlagResponse>> getFeatureFlags(@PathVariable UUID orgId) {
        var flags = organizationService.getFeatureFlags(orgId);
        return ResponseEntity.ok(flags.stream().map(FeatureFlagResponse::fromEntity).toList());
    }

    @PutMapping("/{orgId}/features/{featureKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setFeatureFlag(
            @PathVariable UUID orgId,
            @PathVariable String featureKey,
            @RequestBody Map<String, Object> body) {
        boolean enabled = Boolean.TRUE.equals(body.get("enabled"));
        String configJson = body.containsKey("config") ? body.get("config").toString() : null;
        organizationService.setFeatureFlag(orgId, featureKey, enabled, configJson);
        return ResponseEntity.ok().build();
    }

    // ============================================================
    // Stats / Summary
    // ============================================================

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOrganizationStats() {
        long totalOrgs = organizationRepository.count();
        long activeOrgs = organizationRepository.countByIsActiveTrue();
        return ResponseEntity.ok(Map.of(
                "totalOrgs", totalOrgs,
                "activeOrgs", activeOrgs
        ));
    }
}
