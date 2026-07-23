package com.devmastery.progress.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "spaced_review_schedules",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "topic_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class SpacedReviewEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid") private UUID userId;
    @Column(name = "topic_id", nullable = false, columnDefinition = "uuid") private UUID topicId;
    @Column(name = "topic_slug", nullable = false) private String topicSlug;
    @Column(name = "next_review_date", nullable = false) private LocalDate nextReviewDate;
    @Column(name = "interval_days", nullable = false) private int intervalDays;
    @Column(name = "easiness_factor", nullable = false) private double easeFactor;
    @Column(nullable = false) private int repetitions;
}
