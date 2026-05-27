package com.devmastery.content.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PathRoadmapResponse {
    private PathSummaryDto path;
    private List<LevelRoadmapDto> levels;

    @Data
    @Builder
    public static class PathSummaryDto {
        private String slug;
        private String title;
        private int totalTopics;
    }

    @Data
    @Builder
    public static class LevelRoadmapDto {
        private int level;
        private String label;
        private int topicCount;
        private int completedCount;
        private List<TopicRoadmapDto> topics;
    }

    @Data
    @Builder
    public static class TopicRoadmapDto {
        private String slug;
        private String title;
        private int estimatedMins;
        private boolean completed;
        private boolean hasVisualizer;
        private boolean hasCodeLab;
    }
}
