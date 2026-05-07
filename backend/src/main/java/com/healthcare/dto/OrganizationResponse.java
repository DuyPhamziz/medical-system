package com.healthcare.dto;

import com.healthcare.entity.Organization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {
    private UUID orgId;
    private String name;
    private String type;
    private String email;
    private String phone;
    private String address;
    private String subscriptionPlan;
    private LocalDateTime subscriptionExpiry;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private long memberCount;

    public static OrganizationResponse fromEntity(Organization org, long memberCount) {
        return OrganizationResponse.builder()
                .orgId(org.getOrgId())
                .name(org.getName())
                .type(org.getType())
                .email(org.getEmail())
                .phone(org.getPhone())
                .address(org.getAddress())
                .subscriptionPlan(org.getSubscriptionPlan())
                .subscriptionExpiry(org.getSubscriptionExpiry())
                .isActive(org.getIsActive())
                .createdAt(org.getCreatedAt())
                .memberCount(memberCount)
                .build();
    }
}
