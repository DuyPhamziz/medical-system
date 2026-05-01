package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalScaleResponse {
    @JsonProperty("scaleId")
    private UUID scaleId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("category")
    private String category;

    @JsonProperty("totalQuestions")
    private Integer totalQuestions;

    @JsonProperty("minScore")
    private Integer minScore;

    @JsonProperty("maxScore")
    private Integer maxScore;

    @JsonProperty("scoringFormat")
    private String scoringFormat;

    @JsonProperty("interpretation")
    private Map<String, Object> interpretation;

    @JsonProperty("questions")
    private List<ClinicalScaleQuestion> questions;
}
