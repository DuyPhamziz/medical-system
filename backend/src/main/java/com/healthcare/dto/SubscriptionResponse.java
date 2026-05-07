package com.healthcare.dto;

import com.healthcare.entity.OrgSubscription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID subscriptionId;
    private UUID orgId;
    private String planType;
    private BigDecimal amount;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private String paymentRef;
    private String notes;

    public static SubscriptionResponse fromEntity(OrgSubscription sub) {
        return SubscriptionResponse.builder()
                .subscriptionId(sub.getSubscriptionId())
                .orgId(sub.getOrganization().getOrgId())
                .planType(sub.getPlanType())
                .amount(sub.getAmount())
                .startedAt(sub.getStartedAt())
                .expiresAt(sub.getExpiresAt())
                .isActive(sub.getIsActive())
                .paymentRef(sub.getPaymentRef())
                .notes(sub.getNotes())
                .build();
    }
}
