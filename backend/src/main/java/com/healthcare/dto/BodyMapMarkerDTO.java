package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMapMarkerDTO {
    @JsonProperty("x")
    private Double x;

    @JsonProperty("y")
    private Double y;

    @JsonProperty("level")
    private Integer level;

    @JsonProperty("regionCode")
    private String regionCode;

    @JsonProperty("side")
    private String side;

    @JsonProperty("note")
    private String note;

    @JsonProperty("markedAt")
    private String markedAt;
}
