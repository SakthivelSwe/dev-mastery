package com.devmastery.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * CodeExample entity — runnable code snippets for a topic lesson.
 * Multiple examples per topic at different difficulty levels (1–5).
 * Executed via Judge0 CE self-hosted (is_runnable = true).
 */
@Entity
@Table(name = "code_examples")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"topic", "lesson"})
@EqualsAndHashCode(of = "id")
public class CodeExample {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(nullable = false)
    private Integer level;   // 1=Beginner, 3=Intermediate, 5=Expert

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "time_complexity", length = 50)
    private String timeComplexity;

    @Column(name = "space_complexity", length = 50)
    private String spaceComplexity;

    @Column(name = "is_runnable", nullable = false)
    private Boolean isRunnable = true;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
