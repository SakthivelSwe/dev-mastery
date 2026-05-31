package com.devmastery.progress.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * LearningEvent — Kafka message payload for all learning activity events.
 *
 * Published to topics:
 *   learning.layer.completed  — when a user completes a layer (theory, code, etc.)
 *   learning.code.executed    — when a user runs code via Judge0
 *   learning.streak.updated   — when a user's streak changes
 *   learning.badge.earned     — when a badge is awarded
 *   learning.xp.earned        — when XP is awarded for any reason
 *
 * Partition key: userId (ensures ordering per user across all events)
 */
public record LearningEvent(
        String              eventType,
        String              userId,
        String              topicSlug,
        String              pathSlug,
        String              layerName,
        Map<String, Object> metadata,
        Instant             timestamp
) implements Serializable {

    // ─── Factory methods ──────────────────────────────────────────────────────

    /** Fires when a user marks a learning layer as complete. */
    public static LearningEvent layerCompleted(
            String userId, String topicSlug, String pathSlug, String layerName, int xpEarned
    ) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("xpEarned", xpEarned);
        return new LearningEvent("LAYER_COMPLETED", userId, topicSlug, pathSlug, layerName, meta, Instant.now());
    }

    /** Fires every time a user runs code via the Code Lab. */
    public static LearningEvent codeExecuted(
            String userId, String topicSlug, String tier, String language, boolean success
    ) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("tier",     tier);
        meta.put("language", language);
        meta.put("success",  success);
        return new LearningEvent("CODE_EXECUTED", userId, topicSlug, null, "code", meta, Instant.now());
    }

    /** Fires when a user's daily learning streak changes. */
    public static LearningEvent streakUpdated(String userId, int newStreak, boolean broken) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("newStreak", newStreak);
        meta.put("broken",    broken);
        return new LearningEvent("STREAK_UPDATED", userId, null, null, null, meta, Instant.now());
    }

    /** Fires when a badge is awarded. */
    public static LearningEvent badgeEarned(String userId, String badgeName, int xpAwarded) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("badgeName", badgeName);
        meta.put("xpAwarded", xpAwarded);
        return new LearningEvent("BADGE_EARNED", userId, null, null, null, meta, Instant.now());
    }

    /** Fires for any XP award event. */
    public static LearningEvent xpEarned(String userId, int amount, String reason) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("amount", amount);
        meta.put("reason", reason);
        return new LearningEvent("XP_EARNED", userId, null, null, null, meta, Instant.now());
    }
}
