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
public class TimeSeriesAnswerDTO {
    @JsonProperty("dataPoints")
    private List<TimePointDTO> dataPoints;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimePointDTO {
        @JsonProperty("timestamp")
        private String timestamp;

        @JsonProperty("label")
        private String label;

        @JsonProperty("value")
        private Double value;

        @JsonProperty("note")
        private String note;
    }
}
