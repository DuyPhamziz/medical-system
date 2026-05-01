package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clinical Scale template entity
 * Stores standardized medical assessment scales (PHQ-9, GAD-7, DASS-21, etc.)
 */
@Entity
@Table(name = "clinical_scale")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalScale {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID scaleId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;                    // "PHQ-9", "GAD-7", etc.

    @Column(columnDefinition = "TEXT")
    private String description;             // Full name and purpose

    @Column(nullable = false, length = 50)
    private String category;                // DEPRESSION, ANXIETY, SLEEP, COGNITIVE

    @Column(nullable = false)
    private Integer totalQuestions;         // 9 for PHQ-9, 7 for GAD-7

    @Column(nullable = false)
    private Integer minScore;               // 0

    @Column(nullable = false)
    private Integer maxScore;               // 27 for PHQ-9, 21 for GAD-7

    @Column(length = 50)
    private String scoringFormat;           // "LIKERT_0_3", "LIKERT_0_4", etc.

    /**
     * Scale configuration in JSON:
     * {
     *   "questions": [
     *     {"qId": "phq_q1", "content": "...", "type": "SCALE", "scaleMin": 0, "scaleMax": 3}
     *   ],
     *   "scoring": {
     *     "type": "SUM",
     *     "sourceQuestions": ["phq_q1", "phq_q2", ...],
     *     "resultField": "phq_total_score"
     *   }
     * }
     */
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "config_json")
    private String configJson;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "interpretation_json")
    private String interpretationJson;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
}
