package com.healthcare.dto;

import com.healthcare.entity.OrgFeatureFlag;
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
public class FeatureFlagResponse {
    private UUID flagId;
    private String featureKey;
    private Boolean isEnabled;
    private String configJson;
    private LocalDateTime updatedAt;

    public static FeatureFlagResponse fromEntity(OrgFeatureFlag flag) {
        return FeatureFlagResponse.builder()
                .flagId(flag.getFlagId())
                .featureKey(flag.getFeatureKey())
                .isEnabled(flag.getIsEnabled())
                .configJson(flag.getConfigJson())
                .updatedAt(flag.getUpdatedAt())
                .build();
    }
}
