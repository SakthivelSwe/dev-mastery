package com.devmastery.progress.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_streaks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserStreakEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(name = "user_id", nullable = false, unique = true, columnDefinition = "uuid")
    private UUID userId;
    @Column(name = "current_streak", nullable = false) private int currentStreak;
    @Column(name = "longest_streak", nullable = false) private int longestStreak;
    @Column(name = "last_activity") private LocalDate lastActivityDate;

    /** Unused freezes available. Capped at MAX_FREEZES in service layer. */
    @Column(name = "freeze_count", nullable = false)
    @Builder.Default
    private int freezeCount = 0;

    /** Last date on which a freeze was applied to protect the streak. */
    @Column(name = "last_freeze_used")
    private LocalDate lastFreezeUsed;

    /** Lifetime count of freezes redeemed (never decremented). */
    @Column(name = "total_freezes_used", nullable = false)
    @Builder.Default
    private int totalFreezesUsed = 0;
}
