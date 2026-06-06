package com.devmastery.progress.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_xp_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserXpEventEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid") private UUID userId;
    @Column(name = "topic_id", columnDefinition = "uuid") private UUID topicId;
    @Column(name = "xp_amount", nullable = false) private int xpAmount;
    @Column(name = "event_type", nullable = false) private String eventType;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    @PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
