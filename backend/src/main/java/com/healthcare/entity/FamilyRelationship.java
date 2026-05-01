package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "family_relationship")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyRelationship {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "relationship_id")
    private UUID relationshipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id")
    private FamilyMember person;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_person_id")
    private FamilyMember relatedPerson;

    @Column(name = "relationship_type", length = 50)
    private String relationshipType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
