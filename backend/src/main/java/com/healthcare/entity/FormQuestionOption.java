package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "form_question_option")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormQuestionOption {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "option_id")
    private UUID optionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private FormQuestion question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "trigger_logic")
    private String triggerLogic;
}