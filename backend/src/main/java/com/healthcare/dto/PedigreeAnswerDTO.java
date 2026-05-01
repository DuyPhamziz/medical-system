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
public class PedigreeAnswerDTO {
    @JsonProperty("nodes")
    private List<PedigreeNodeDTO> nodes;

    @JsonProperty("edges")
    private List<PedigreeEdgeDTO> edges;

    @JsonProperty("rootNodeId")
    private String rootNodeId;

    @JsonProperty("version")
    private Integer version;

    @JsonProperty("createdAt")
    private String createdAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PedigreeNodeDTO {
        @JsonProperty("nodeId")
        private String nodeId;

        @JsonProperty("fullName")
        private String fullName;

        @JsonProperty("gender")
        private String gender;

        @JsonProperty("yearOfBirth")
        private Integer yearOfBirth;

        @JsonProperty("yearOfDeath")
        private Integer yearOfDeath;

        @JsonProperty("isDeceased")
        private Boolean isDeceased;

        @JsonProperty("isProband")
        private Boolean isProband;

        @JsonProperty("linkedPatientId")
        private UUID linkedPatientId;

        @JsonProperty("diseases")
        private List<String> diseases;

        @JsonProperty("x")
        private Double x;

        @JsonProperty("y")
        private Double y;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PedigreeEdgeDTO {
        @JsonProperty("edgeId")
        private String edgeId;

        @JsonProperty("fromNodeId")
        private String fromNodeId;

        @JsonProperty("toNodeId")
        private String toNodeId;

        @JsonProperty("relationType")
        private String relationType;
    }
}
