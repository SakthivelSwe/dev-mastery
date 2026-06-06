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
    @Column(name = "last_activity_date") private LocalDate lastActivityDate;
}
