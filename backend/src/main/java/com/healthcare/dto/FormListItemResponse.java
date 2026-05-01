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
public class FormListItemResponse {
    private UUID formId;
    private String title;
    private String description;
    private boolean template;
    private boolean publicForm;
    private boolean paid;
    private BigDecimal price;
    private String status;
    private LocalDateTime updatedAt;
    private int sectionCount;
}