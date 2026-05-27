package com.devmastery.progress.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lesson_completions")
@Getter
@Setter
public class LessonCompletion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "completed_at", nullable = false)
    private OffsetDateTime completedAt;

    @Column(name = "time_spent_secs", nullable = false)
    private Integer timeSpentSecs = 0;

    @PrePersist
    public void prePersist() {
        if (this.completedAt == null) {
            this.completedAt = OffsetDateTime.now();
        }
    }
}
