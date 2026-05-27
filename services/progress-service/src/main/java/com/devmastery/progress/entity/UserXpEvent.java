package com.devmastery.progress.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_xp_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserXpEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "xp_amount", nullable = false)
    private Integer xpAmount;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "description")
    private String description;

    @CreationTimestamp
    @Column(name = "earned_at", nullable = false, updatable = false)
    private OffsetDateTime earnedAt;
}
