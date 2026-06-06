package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lesson_completions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class LessonCompletionEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "lesson_id", nullable = false, columnDefinition = "uuid")
    private UUID lessonId;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @PrePersist
    void onCreate() { if (completedAt == null) completedAt = Instant.now(); }
}
