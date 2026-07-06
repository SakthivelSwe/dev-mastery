package com.devmastery.quiz.internal;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Tracks per-user per-topic quiz difficulty for adaptive question selection.
 * Difficulty level 1–4 maps to the CODE section levels (Beginner→Expert).
 * After 5+ attempts: accuracy < 60% → level down, accuracy > 85% → level up.
 */
@Entity
@Table(name = "quiz_difficulty")
class QuizDifficultyEntity {

    @EmbeddedId
    private QuizDifficultyKey id;

    @Column(name = "current_level", nullable = false)
    private int currentLevel = 2;  // start at Intermediate

    @Column(name = "attempts", nullable = false)
    private int attempts = 0;

    @Column(name = "correct", nullable = false)
    private int correct = 0;

    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated = Instant.now();

    // ── factory ────────────────────────────────────────────────

    static QuizDifficultyEntity initial(UUID userId, String topicSlug) {
        var e = new QuizDifficultyEntity();
        e.id = new QuizDifficultyKey(userId, topicSlug);
        return e;
    }

    // ── business logic ─────────────────────────────────────────

    void recordResult(int scored, int outOf) {
        attempts += outOf;
        correct  += scored;
        lastUpdated = Instant.now();

        // Only adjust after at least 5 attempts to avoid noise
        if (attempts >= 5) {
            double accuracy = (double) correct / attempts;
            if (accuracy < 0.60 && currentLevel > 1) {
                currentLevel--;
                resetAccumulator();
            } else if (accuracy > 0.85 && currentLevel < 4) {
                currentLevel++;
                resetAccumulator();
            }
        }
    }

    private void resetAccumulator() {
        // Reset so the next window starts fresh at the new level
        attempts = 0;
        correct  = 0;
    }

    // ── getters ────────────────────────────────────────────────

    UUID getUserId()        { return id.getUserId(); }
    String getTopicSlug()   { return id.getTopicSlug(); }
    int getCurrentLevel()   { return currentLevel; }
    int getAttempts()       { return attempts; }
    int getCorrect()        { return correct; }
    Instant getLastUpdated(){ return lastUpdated; }
}

