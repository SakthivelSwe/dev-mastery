package com.devmastery.progress.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ProgressService {

    ProgressSummary summary(UUID userId);

    List<ReviewItem> dueReviews(UUID userId);

    void submitReview(UUID userId, UUID topicId, int rating);

    record ProgressSummary(UUID userId, long xp, int currentStreak, int longestStreak,
                           int topicsCompleted, int badgesEarned) { }

    record ReviewItem(UUID topicId, String topicSlug, LocalDate dueDate,
                      int repetitions, double easeFactor) { }
}
