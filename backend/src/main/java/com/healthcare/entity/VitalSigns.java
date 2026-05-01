package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vital_signs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalSigns {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vital_sign_id")
    private UUID vitalSignId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit visit;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "height")
    private Double height;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "oxygen_saturation")
    private Integer oxygenSaturation;

    @PrePersist
    void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
        calculateBmi();
    }

    @PreUpdate
    void onUpdate() {
        calculateBmi();
    }

    private void calculateBmi() {
        if (weight != null && height != null && height > 0) {
            // Height is usually in cm, convert to meters
            double heightInMeters = height / 100.0;
            this.bmi = weight / (heightInMeters * heightInMeters);
        }
    }
}
