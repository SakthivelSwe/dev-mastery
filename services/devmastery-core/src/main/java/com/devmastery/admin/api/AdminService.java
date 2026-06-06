package com.devmastery.admin.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AdminService {

    DashboardStats getDashboard();

    void updateTopicSection(String slug, String section, String content);

    List<RunnerTemplate> getRunnerTemplates();

    void upsertRunnerTemplate(String language, String name, String urlTemplate);

    record DashboardStats(long totalUsers, long totalTopics, long totalLessons,
                          long totalCompletions, long totalQuizAttempts) { }

    record RunnerTemplate(UUID id, String language, String name, String urlTemplate, boolean active) { }
}
