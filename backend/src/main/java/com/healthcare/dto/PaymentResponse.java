package com.healthcare.dto;

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
public class PaymentResponse {

    private UUID paymentId;
    private BigDecimal amount;
    private String description;
    private LocalDateTime expiryDate;
    private String planType;
    private LocalDateTime createdAt;
    private UUID userId;
    private String userName;
    private UUID statusId;
    private String statusName;
    private UUID methodId;
    private String methodName;
}
