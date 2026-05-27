package com.devmastery.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreakUpdatedEvent {
    private UUID userId;
    private int currentStreak;
    private int longestStreak;
    private int freezeCount;
}
