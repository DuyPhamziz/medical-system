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
public class FileUploadAnswerDTO {
    @JsonProperty("url")
    private String url;

    @JsonProperty("fileName")
    private String fileName;

    @JsonProperty("fileSize")
    private Long fileSize;

    @JsonProperty("mimeType")
    private String mimeType;

    @JsonProperty("uploadedAt")
    private String uploadedAt;

    @JsonProperty("storageProvider")
    private String storageProvider;

    @JsonProperty("checksum")
    private String checksum;
}
