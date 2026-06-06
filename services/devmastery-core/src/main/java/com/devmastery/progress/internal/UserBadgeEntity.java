package com.devmastery.progress.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_badges",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "badge_slug"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserBadgeEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid") private UUID userId;
    @Column(name = "badge_slug", nullable = false) private String badgeSlug;
    @Column(name = "earned_at", nullable = false) private Instant earnedAt;

    @PrePersist void onCreate() { if (earnedAt == null) earnedAt = Instant.now(); }
}
