package com.devmastery.common.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Fired by the content module when a user completes a lesson.
 * Consumed by the progress module via {@code @EventListener} —
 * replaces the previous Kafka {@code lesson.completed} topic.
 */
public record LessonCompletedEvent(
        UUID userId,
        UUID lessonId,
        UUID topicId,
        Instant occurredAt
) { }
