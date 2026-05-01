package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalScaleQuestion {
    @JsonProperty("qId")
    private String questionId;

    @JsonProperty("content")
    private String content;

    @JsonProperty("type")
    private String type;

    @JsonProperty("scaleMin")
    private Integer scaleMin;

    @JsonProperty("scaleMax")
    private Integer scaleMax;

    @JsonProperty("scaleLabels")
    private Map<String, String> scaleLabels;

    @JsonProperty("options")
    private List<Map<String, String>> options;
}
