package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgDetailResponse {
    private OrganizationResponse organization;
    private SubscriptionResponse activeSubscription;
    private List<SubscriptionResponse> subscriptionHistory;
    private List<FeatureFlagResponse> featureFlags;
    private long doctorCount;
    private long patientCount;
}
