package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalScaleScoreResponse {
    @JsonProperty("score")
    private Integer score;

    @JsonProperty("interpretation")
    private String interpretation;

    @JsonProperty("severity")
    private String severity;

    @JsonProperty("clinicalNote")
    private String clinicalNote;

    @JsonProperty("recommendations")
    private List<String> recommendations;
}
