package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "family_member_disease")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberDisease {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_member_id")
    private FamilyMember familyMember;

    @Column(name = "disease_name")
    private String diseaseName;

    @Column(name = "diagnosed_year")
    private Integer diagnosedYear;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
