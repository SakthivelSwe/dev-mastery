package com.devmastery.content.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Public read-only contract for content. */
public interface ContentService {

    List<TopicSummary> listTopics(String pathSlug, Integer level, int page, int size);

    TopicDetail getTopicBySlug(String slug);

    List<PathSummary> listPaths();

    PathDetail getPathBySlug(String slug);

    List<LessonView> getLessonsByTopic(UUID topicId);

    /**
     * Roadmap view of a learning path — topics grouped by skill level (1–5)
     * with per-user completion flags. {@code userId} may be {@code null} for
     * unauthenticated visitors (everything will be marked not-completed).
     */
    PathRoadmap getPathRoadmap(String slug, UUID userId);

    record PathSummary(UUID id, String slug, String title, String description, String icon) { }

    record PathDetail(UUID id, String slug, String title, String description,
                      List<TopicSummary> topics) { }

    record TopicSummary(UUID id, String slug, String title, int level, int xpReward,
                        int estimatedMins, List<String> tags) { }

    record TopicDetail(UUID id, String slug, String title, int level, int xpReward,
                       Map<String, String> sections,
                       List<CodeExampleView> codeExamples,
                       List<String> tags) { }

    record LessonView(UUID id, UUID topicId, String section, String content) { }

    record CodeExampleView(UUID id, String language, String code, String explanation,
                           String expectedOutput, String tryOnlineUrl) { }

    // ── Roadmap DTOs (match frontend RoadmapCanvas types) ───────────────────
    record PathRoadmap(PathHeader path, List<LevelGroup> levels) { }

    record PathHeader(String slug, String title, int totalTopics) { }

    record LevelGroup(int level, String label, int topicCount, int completedCount,
                      List<TopicRoadmap> topics) { }

    record TopicRoadmap(String slug, String title, int estimatedMins,
                        boolean completed, boolean hasVisualizer, boolean hasCodeLab) { }
}
