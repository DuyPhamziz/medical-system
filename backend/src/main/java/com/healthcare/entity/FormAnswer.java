package com.healthcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "form_answer")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "answer_id")
    private UUID answerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private AnswerSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private FormQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private FormQuestionOption option;

    @Column(name = "repeat_index", nullable = false)
    private int repeatIndex;

    @Column(name = "value_text", columnDefinition = "TEXT")
    private String valueText;

    @Column(name = "value_number", precision = 12, scale = 2)
    private BigDecimal valueNumber;

    @Column(name = "value_date")
    private LocalDate valueDate;

    @Column(name = "value_datetime")
    private LocalDateTime valueDatetime;

    @Column(name = "value_boolean")
    private Boolean valueBoolean;

    @Column(name = "value_json", columnDefinition = "jsonb")
    private String valueJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}