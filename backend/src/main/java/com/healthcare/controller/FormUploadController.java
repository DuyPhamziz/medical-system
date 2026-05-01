package com.healthcare.controller;

import com.healthcare.dto.FormUploadRequest;
import com.healthcare.dto.FormUploadResponse;
import com.healthcare.service.FormUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

/**
 * Controller for handling file uploads within forms
 * Manages presigned URL generation and file retrieval
 */
@Slf4j
@RestController
@RequestMapping("/api/bff/uploads")
public class FormUploadController {

    private final FormUploadService formUploadService;

    @Value("${upload.base-path:uploads}")
    private String uploadBasePath;

    public FormUploadController(FormUploadService formUploadService) {
        this.formUploadService = formUploadService;
    }

    /**
     * Request a presigned URL for file upload
     */
    @PostMapping("/presigned-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FormUploadResponse> getPresignedUrl(@RequestBody FormUploadRequest request) {
        log.info("Requesting presigned URL for file: {}", request.getFileName());
        FormUploadResponse response = formUploadService.generatePresignedUrl(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Direct file upload (for local storage provider)
     * In production with S3, the frontend would upload directly to S3 using the presigned URL
     */
    @PutMapping("/upload/{uploadId}/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> uploadFile(
            @PathVariable String uploadId,
            @PathVariable String fileName,
            @RequestBody byte[] fileContent) {
        
        try {
            // Validate upload session
            formUploadService.validateUpload(uploadId, fileName, fileContent.length);

            // Save file to disk
            Path uploadDir = Paths.get(uploadBasePath, uploadId);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path filePath = uploadDir.resolve(fileName);
            Files.write(filePath, fileContent, StandardOpenOption.CREATE, StandardOpenOption.WRITE);

            log.info("File uploaded successfully: {} (size: {} bytes)", fileName, fileContent.length);
            return ResponseEntity.ok().build();

        } catch (IOException e) {
            log.error("Error saving uploaded file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Upload validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Retrieve uploaded file by URL
     * Called by frontend to access previously uploaded files
     */
    @GetMapping("/files/{uploadId}/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFile(
            @PathVariable String uploadId,
            @PathVariable String fileName) {
        
        try {
            Path filePath = Paths.get(uploadBasePath, uploadId, fileName);
            
            // Security: Ensure file exists and is within upload directory
            if (!Files.exists(filePath) || !filePath.normalize().startsWith(
                    Paths.get(uploadBasePath).normalize())) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Error forming file URL: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            log.error("Error retrieving file: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete uploaded file
     * Called when user cancels form or deletes answer
     */
    @DeleteMapping("/files/{uploadId}/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String uploadId,
            @PathVariable String fileName) {
        
        try {
            Path filePath = Paths.get(uploadBasePath, uploadId, fileName);
            
            // Security: Ensure file is within upload directory
            if (!filePath.normalize().startsWith(
                    Paths.get(uploadBasePath).normalize())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Files.deleteIfExists(filePath);
            
            // Clean up empty directory
            Path uploadDir = Paths.get(uploadBasePath, uploadId);
            if (Files.exists(uploadDir) && Files.list(uploadDir).count() == 0) {
                Files.deleteIfExists(uploadDir);
            }

            return ResponseEntity.ok().build();

        } catch (IOException e) {
            log.error("Error deleting file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
