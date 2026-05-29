package com.devmastery.progress.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "spaced_review_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpacedReviewSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "topic_id", nullable = false)
    private UUID topicId;

    @Column(name = "topic_slug", nullable = false)
    private String topicSlug;

    @Builder.Default
    @Column(name = "easiness_factor", nullable = false)
    private float easinessFactor = 2.5f;

    @Builder.Default
    @Column(name = "interval_days", nullable = false)
    private int intervalDays = 0;

    @Builder.Default
    @Column(name = "repetitions", nullable = false)
    private int repetitions = 0;

    @Column(name = "next_review_date", nullable = false)
    private Instant nextReviewDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
