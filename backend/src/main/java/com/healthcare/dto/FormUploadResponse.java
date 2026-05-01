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
public class FormUploadResponse {

    @JsonProperty("uploadUrl")
    private String uploadUrl;

    @JsonProperty("fileUrl")
    private String fileUrl;

    @JsonProperty("storageProvider")
    private String storageProvider;

    @JsonProperty("checksum")
    private String checksum;

    @JsonProperty("expiresAt")
    private String expiresAt;
}
