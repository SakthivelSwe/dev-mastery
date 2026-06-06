package com.devmastery.common.events;

import java.time.Instant;
import java.util.UUID;

public record QuizSubmittedEvent(
        UUID userId,
        UUID quizId,
        int score,
        int maxScore,
        Instant occurredAt
) { }
