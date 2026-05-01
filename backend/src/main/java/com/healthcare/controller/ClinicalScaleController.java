package com.healthcare.controller;

import com.healthcare.dto.*;
import com.healthcare.service.ClinicalScaleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for clinical scale management and scoring
 */
@Slf4j
@RestController
@RequestMapping("/api/clinical-scales")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClinicalScaleController {

    @Autowired
    private ClinicalScaleService clinicalScaleService;

    /**
     * Get all available scales
     * GET /api/clinical-scales
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClinicalScaleResponse>> getAllScales() {
        List<ClinicalScaleResponse> scales = clinicalScaleService.getAllScales();
        return ResponseEntity.ok(scales);
    }

    /**
     * Get scales by category
     * GET /api/clinical-scales?category=DEPRESSION
     */
    @GetMapping(params = "category")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClinicalScaleResponse>> getScalesByCategory(
            @RequestParam String category) {
        List<ClinicalScaleResponse> scales = clinicalScaleService.getScalesByCategory(category);
        return ResponseEntity.ok(scales);
    }

    /**
     * Get scale detail by ID
     * GET /api/clinical-scales/{scaleId}
     */
    @GetMapping("/{scaleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClinicalScaleResponse> getScaleDetail(
            @PathVariable UUID scaleId) {
        try {
            ClinicalScaleResponse scale = clinicalScaleService.getScaleDetail(scaleId, null);
            return ResponseEntity.ok(scale);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get scale detail by name
     * GET /api/clinical-scales/by-name/{scaleName}
     */
    @GetMapping("/by-name/{scaleName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClinicalScaleResponse> getScaleByName(
            @PathVariable String scaleName) {
        try {
            ClinicalScaleResponse scale = clinicalScaleService.getScaleDetail(null, scaleName);
            return ResponseEntity.ok(scale);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Insert scale into form (creates questions from template)
     * POST /api/forms/{formId}/insert-scale
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClinicalScaleInsertResponse> insertScaleIntoForm(
            @RequestParam UUID formId,
            @RequestBody ClinicalScaleInsertRequest request) {
        try {
            ClinicalScaleInsertResponse response = clinicalScaleService.insertScaleIntoForm(
                    formId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Error inserting scale: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Calculate score from answers
     * POST /api/clinical-scales/{scaleId}/calculate-score
     */
    @PostMapping("/{scaleId}/calculate-score")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClinicalScaleScoreResponse> calculateScore(
            @PathVariable UUID scaleId,
            @RequestBody ClinicalScaleScoreRequest request) {
        try {
            ClinicalScaleScoreResponse response = clinicalScaleService.calculateScore(
                    scaleId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error calculating score: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error during score calculation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
