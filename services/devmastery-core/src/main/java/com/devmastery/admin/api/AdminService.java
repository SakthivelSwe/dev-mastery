package com.devmastery.admin.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminService {

    DashboardStats getDashboard();

    /** Upsert a single topic section into the lessons table. */
    void updateTopicSection(String slug, String section, String content);

    /** Bulk-upsert all layer content for multiple topics at once. */
    void importTopicLayers(List<TopicLayerImport> topics);

    List<RunnerTemplate> getRunnerTemplates();

    void upsertRunnerTemplate(String language, String name, String urlTemplate);

    record DashboardStats(long totalUsers, long totalTopics, long totalLessons,
                          long totalCompletions, long totalQuizAttempts) { }

    record RunnerTemplate(UUID id, String language, String name, String urlTemplate, boolean active) { }

    record TopicLayerImport(String slug, Map<String, String> layers) { }
}
