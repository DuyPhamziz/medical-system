package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "form_question")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "question_id")
    private UUID questionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private FormSection section;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    private QuestionType questionType;

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "allow_repeat", nullable = false)
    private boolean allowRepeat;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(name = "min_value", precision = 12, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 12, scale = 2)
    private BigDecimal maxValue;

    @Column(name = "min_length")
    private Integer minLength;

    @Column(name = "max_length")
    private Integer maxLength;

    @Column(name = "validation_pattern")
    private String validationPattern;

    @Column(name = "validation_message")
    private String validationMessage;

    @Column(columnDefinition = "TEXT")
    private String placeholder;

    @Column(name = "helper_text", columnDefinition = "TEXT")
    private String helperText;

    @Column(name = "scale_min")
    private Integer scaleMin;

    @Column(name = "scale_max")
    private Integer scaleMax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scale_id")
    private ClinicalScale clinicalScale;

    @Column(name = "trigger_logic", columnDefinition = "TEXT")
    private String triggerLogic;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "config_json")
    private String configJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @org.hibernate.annotations.BatchSize(size = 100)
    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<FormQuestionOption> options = new ArrayList<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
