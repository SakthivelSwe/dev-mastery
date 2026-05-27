package com.devmastery.content.dto.admin;

import java.util.List;

public record AdminTopicStatsResponse(
        long totalTopics,
        long totalPublished,
        long totalDrafts,
        long totalNeedingContent,
        List<AdminTopicStatsItem> pathStats
) {}
