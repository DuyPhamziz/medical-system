package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "family_member")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "family_member_id")
    private UUID familyMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "year_of_birth")
    private Integer yearOfBirth;

    @Builder.Default
    @Column(name = "is_patient")
    private Boolean isPatient = false;
}
