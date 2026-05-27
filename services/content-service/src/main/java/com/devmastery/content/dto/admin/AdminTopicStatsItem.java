package com.devmastery.content.dto.admin;

public record AdminTopicStatsItem(
        String pathSlug,
        String pathTitle,
        long totalTopics,
        long publishedTopics,
        long draftTopics,
        long needingContentTopics
) {}
