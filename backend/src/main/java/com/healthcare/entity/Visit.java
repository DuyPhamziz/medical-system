package com.healthcare.entity;

import com.healthcare.entity.enums.VisitStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "visit")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "visit_id")
    private UUID visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(name = "reason_for_visit", length = 1000)
    private String reasonForVisit;

    @Column(name = "diagnosis", length = 2000)
    private String diagnosis;

    @Column(name = "treatment_plan", length = 2000)
    private String treatmentPlan;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private VisitStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = VisitStatus.SCHEDULED;
        }
    }
}
