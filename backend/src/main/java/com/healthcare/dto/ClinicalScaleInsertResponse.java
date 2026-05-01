package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalScaleInsertResponse {
    @JsonProperty("formId")
    private UUID formId;

    @JsonProperty("questionsAdded")
    private Integer questionsAdded;

    @JsonProperty("message")
    private String message;
}
