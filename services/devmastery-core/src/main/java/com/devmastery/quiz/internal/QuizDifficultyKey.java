package com.devmastery.quiz.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
class QuizDifficultyKey implements Serializable {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "topic_slug", nullable = false)
    private String topicSlug;

    QuizDifficultyKey() {}

    QuizDifficultyKey(UUID userId, String topicSlug) {
        this.userId = userId;
        this.topicSlug = topicSlug;
    }

    UUID getUserId()      { return userId; }
    String getTopicSlug() { return topicSlug; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof QuizDifficultyKey k)) return false;
        return Objects.equals(userId, k.userId) && Objects.equals(topicSlug, k.topicSlug);
    }
    @Override public int hashCode() { return Objects.hash(userId, topicSlug); }
}

