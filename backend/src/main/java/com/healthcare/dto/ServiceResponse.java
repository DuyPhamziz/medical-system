package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {

    private UUID serviceId;
    private String name;
    private String description;
    private BigDecimal price;
    private String type;

    public static ServiceResponse fromEntity(com.healthcare.entity.Service entity) {
        return ServiceResponse.builder()
                .serviceId(entity.getServiceId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .type(entity.getType())
                .build();
    }
}
