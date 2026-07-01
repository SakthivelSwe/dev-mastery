package com.devmastery.content.api;

import com.devmastery.common.events.LessonCompletedEvent;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Write-side contract for content (called by lesson completion flow and admin import). */
public interface ContentCommandService {

    /** Marks a lesson as completed; publishes {@link LessonCompletedEvent}. */
    void completeLesson(UUID userId, UUID lessonId);

    /**
     * Upserts a single topic section (lesson) by topic slug.
     * Creates a new lesson row if one doesn't exist, updates it if it does.
     */
    void upsertTopicSection(String topicSlug, String sectionType, String content);

    /**
     * Bulk upsert: for each topic entry, writes/updates every provided section.
     * Topics not found in the DB are silently skipped.
     */
    void importTopicLayers(List<TopicImport> topics);

    record TopicImport(String slug, Map<String, String> layers) { }
}
