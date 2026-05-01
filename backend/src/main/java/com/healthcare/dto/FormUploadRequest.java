package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormUploadRequest {

    @JsonProperty("fileName")
    private String fileName;

    @JsonProperty("mimeType")
    private String mimeType;

    @JsonProperty("fileSize")
    private Long fileSize;

    @JsonProperty("questionId")
    private String questionId;

    public void validate() {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("fileName is required");
        }

        if (fileName.contains("..") || fileName.contains("/")) {
            throw new IllegalArgumentException("Invalid fileName - path traversal detected");
        }

        if (mimeType == null || mimeType.isBlank()) {
            throw new IllegalArgumentException("mimeType is required");
        }

        if (fileSize == null || fileSize <= 0) {
            throw new IllegalArgumentException("fileSize must be positive");
        }
    }
}
