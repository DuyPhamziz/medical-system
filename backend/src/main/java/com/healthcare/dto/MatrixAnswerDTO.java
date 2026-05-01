package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatrixAnswerDTO {
    @JsonProperty("rowId")
    private String rowId;

    @JsonProperty("selectedOptionIds")
    private List<String> selectedOptionIds;

    @JsonProperty("selectedOptionId")
    private String selectedOptionId;

    @JsonProperty("rowLabel")
    private String rowLabel;

    @JsonProperty("note")
    private String note;
}
