package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculatedAnswerDTO {
    @JsonProperty("formula")
    private String formula;

    @JsonProperty("result")
    private Double result;

    @JsonProperty("sourceAnswerIds")
    private List<UUID> sourceAnswerIds;

    @JsonProperty("computedAt")
    private String computedAt;

    @JsonProperty("interpretation")
    private String interpretation;
}
