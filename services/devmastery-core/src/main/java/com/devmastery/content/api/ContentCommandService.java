package com.devmastery.content.api;

import com.devmastery.common.events.LessonCompletedEvent;

import java.util.UUID;

/** Write-side contract for content (called by lesson completion flow). */
public interface ContentCommandService {

    /** Marks a lesson as completed; publishes {@link LessonCompletedEvent}. */
    void completeLesson(UUID userId, UUID lessonId);
}
