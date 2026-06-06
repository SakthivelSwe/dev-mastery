package com.devmastery.quiz.internal;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class QuizEntity {
    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(nullable = false) private String title;
    @Column(name = "topic_id", columnDefinition = "uuid") private UUID topicId;
}

@Entity
@Table(name = "quiz_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class QuizQuestionEntity {
    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(name = "quiz_id", nullable = false, columnDefinition = "uuid") private UUID quizId;
    @Column(columnDefinition = "text", nullable = false) private String prompt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<String> options;

    @Column(name = "correct_option", nullable = false) private String correctOption;
    @Column(name = "display_order") private int displayOrder;
}
