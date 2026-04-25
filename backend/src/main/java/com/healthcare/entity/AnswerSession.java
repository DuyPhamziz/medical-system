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
@Table(name = "answer_session")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id")
    private UUID sessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "visit_id")
    private UUID visitId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnswerSessionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnswerSource source;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "last_saved_at", nullable = false)
    private LocalDateTime lastSavedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Builder.Default
    @Column(name = "total_score", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalScore = BigDecimal.ZERO;

    @Builder.Default
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormAnswer> answers = new ArrayList<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (startedAt == null) {
            startedAt = now;
        }
        if (lastSavedAt == null) {
            lastSavedAt = now;
        }
        if (status == null) {
            status = AnswerSessionStatus.DRAFT;
        }
        if (source == null) {
            source = AnswerSource.PATIENT;
        }
        if (totalScore == null) {
            totalScore = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void onUpdate() {
        lastSavedAt = LocalDateTime.now();
    }
}