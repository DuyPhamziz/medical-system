package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String action; // e.g., "VIEW_PATIENT", "UPDATE_FORM"

    @Column(name = "resource_type")
    private String resourceType; // e.g., "PATIENT", "FORM"

    @Column(name = "resource_id")
    private String resourceId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreatedDate
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @CreatedBy
    @Column(name = "user_id", updatable = false)
    private UUID userId;
}
