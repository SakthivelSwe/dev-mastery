package com.devmastery.progress.dto;

/**
 * Flat summary DTO returned by GET /v1/progress/summary.
 * Used by both the web frontend and Android app.
 *
 * @param totalXp          Total XP earned by the user
 * @param level            Numeric level derived from XP (1-5)
 * @param completedTopics  Number of topics with status = "completed"
 * @param streak           Current daily streak (in days)
 * @param dueReviewsCount  Number of spaced-review items due today or overdue
 */
public record ProgressSummaryResponse(
        int totalXp,
        int level,
        int completedTopics,
        int streak,
        int dueReviewsCount
) {}

