package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LookupAnswerDTO {
    @JsonProperty("lookupSource")
    private String lookupSource;

    @JsonProperty("selectedValueIds")
    private List<String> selectedValueIds;

    @JsonProperty("selectedValues")
    private List<Map<String, Object>> selectedValues;

    @JsonProperty("searchQuery")
    private String searchQuery;
}
