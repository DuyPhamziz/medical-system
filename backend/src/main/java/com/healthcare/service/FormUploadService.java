package com.healthcare.service;

import com.healthcare.dto.FormUploadRequest;
import com.healthcare.dto.FormUploadResponse;
import com.healthcare.exception.FormValidationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Service for generating presigned URLs for file uploads
 * Supports local file storage, can be extended for S3/Azure/GCS
 */
@Slf4j
@Service
public class FormUploadService {

    @Value("${upload.base-path:uploads}")
    private String uploadBasePath;

    @Value("${upload.max-file-size:10485760}")
    private long maxFileSize;

    @Value("${upload.allowed-mime-types:application/pdf,image/jpeg,image/png,image/gif,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv}")
    private String allowedMimeTypesConfig;

    @Value("${upload.url-base:http://localhost:8080/api/uploads}")
    private String urlBase;

    // Thread-safe cache for presigned URLs (in production, use distributed cache like Redis)
    private static final Map<String, PresignedUrlData> presignedUrlCache = new java.util.concurrent.ConcurrentHashMap<>();

    private static final long PRESIGNED_URL_EXPIRY_MINUTES = 15;

    static class PresignedUrlData {
        String filePath;
        long expiresAt;
        String checksum;

        PresignedUrlData(String filePath, long expiresAt, String checksum) {
            this.filePath = filePath;
            this.expiresAt = expiresAt;
            this.checksum = checksum;
        }
    }

    /**
     * Generate presigned URL for file upload
     */
    public FormUploadResponse generatePresignedUrl(FormUploadRequest request) {
        try {
            // Validate input
            request.validate();
            validateMimeType(request.getMimeType());
            validateFileSize(request.getFileSize());

            // Generate unique identifiers
            String uploadId = UUID.randomUUID().toString();
            String fileName = sanitizeFileName(request.getFileName());
            String filePath = generateFilePath(uploadId, fileName);
            String checksum = generateChecksum(fileName);

            // Create upload directory
            Path uploadDir = Paths.get(uploadBasePath, uploadId);
            Files.createDirectories(uploadDir);

            // Generate URLs
            String uploadUrl = urlBase + "/upload/" + uploadId + "/" + fileName;
            String fileUrl = urlBase + "/files/" + uploadId + "/" + fileName;

            // Cache presigned URL data
            long expiresAtMs = System.currentTimeMillis() + (PRESIGNED_URL_EXPIRY_MINUTES * 60 * 1000);
            presignedUrlCache.put(uploadId, new PresignedUrlData(filePath, expiresAtMs, checksum));

            Instant expiresAt = Instant.now().plus(PRESIGNED_URL_EXPIRY_MINUTES, ChronoUnit.MINUTES);

            log.info("Generated presigned URL for file: {} (size: {} bytes, uploadId: {})",
                    request.getFileName(), request.getFileSize(), uploadId);

            return FormUploadResponse.builder()
                    .uploadUrl(uploadUrl)
                    .fileUrl(fileUrl)
                    .storageProvider("LOCAL")
                    .checksum(checksum)
                    .expiresAt(expiresAt.toString())
                    .build();

        } catch (IOException e) {
            log.error("Error generating presigned URL", e);
            throw new FormValidationException("Failed to generate upload URL: " + e.getMessage());
        }
    }

    /**
     * Validate file can be saved (called after successful upload)
     */
    public void validateUpload(String uploadId, String fileName, long fileSize) {
        PresignedUrlData data = presignedUrlCache.get(uploadId);
        if (data == null) {
            throw new FormValidationException("Upload session expired or not found");
        }

        if (System.currentTimeMillis() > data.expiresAt) {
            presignedUrlCache.remove(uploadId);
            throw new FormValidationException("Upload URL has expired");
        }

        if (fileSize > maxFileSize) {
            throw new FormValidationException("File size exceeds maximum allowed size");
        }

        log.info("Upload validation passed for uploadId: {}", uploadId);
    }

    /**
     * Get cached presigned URL data
     */
    public PresignedUrlData getPresignedUrlData(String uploadId) {
        PresignedUrlData data = presignedUrlCache.get(uploadId);
        if (data != null && System.currentTimeMillis() <= data.expiresAt) {
            return data;
        }
        presignedUrlCache.remove(uploadId);
        return null;
    }

    /**
     * Clean up expired presigned URLs
     */
    public void cleanupExpiredUrls() {
        presignedUrlCache.entrySet().removeIf(e ->
                System.currentTimeMillis() > e.getValue().expiresAt
        );
        log.debug("Cleaned up expired presigned URLs");
    }

    // ============ Helper Methods ============

    private void validateMimeType(String mimeType) {
        Set<String> allowed = Set.of(allowedMimeTypesConfig.split(","));
        if (!allowed.contains(mimeType.trim())) {
            throw new FormValidationException(
                    String.format("MIME type '%s' not allowed", mimeType));
        }
    }

    private void validateFileSize(long fileSize) {
        if (fileSize > maxFileSize) {
            throw new FormValidationException(
                    String.format("File size %d exceeds limit of %d bytes",
                            fileSize, maxFileSize));
        }
    }

    private String sanitizeFileName(String fileName) {
        // Remove unsafe characters, keep only alphanumeric, dash, underscore, dot
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String generateFilePath(String uploadId, String fileName) {
        return uploadBasePath + "/" + uploadId + "/" + fileName;
    }

    private String generateChecksum(String fileName) {
        // Generate checksum based on filename + timestamp for upload session tracking
        // Note: this is a session identifier, not a file integrity hash;
        // actual file integrity should be verified after upload completes
        return DigestUtils.sha256Hex(fileName + System.nanoTime());
    }
}
