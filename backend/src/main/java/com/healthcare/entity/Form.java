package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.healthcare.entity.enums.FormVisibility;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "form")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "form_id")
    private UUID formId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_template", nullable = false)
    private boolean template;

    @Column(name = "is_public", nullable = false)
    private boolean publicForm;

    @Column(name = "is_paid", nullable = false)
    private boolean paid;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FormStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private FormVisibility visibility = FormVisibility.DOCTOR_ONLY;

    @Column(nullable = false)
    private int version;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Builder.Default
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<FormSection> sections = new ArrayList<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (status == null) {
            status = FormStatus.DRAFT;
        }
        if (visibility == null) {
            visibility = FormVisibility.DOCTOR_ONLY;
        }
        if (version <= 0) {
            version = 1;
        }
        if (price == null) {
            price = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void onUpdate() {
        if (visibility == null) {
            visibility = FormVisibility.DOCTOR_ONLY;
        }
        updatedAt = LocalDateTime.now();
    }
}