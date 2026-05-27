package com.devmastery.content.service;

import com.devmastery.content.cache.ContentCacheLoader;
import com.devmastery.content.dto.PathRoadmapResponse;
import com.devmastery.content.entity.LearningPath;
import com.devmastery.content.entity.Topic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PathRoadmapService {

    private final ContentCacheLoader cacheLoader;
    private final ProgressClient progressClient;

    @Cacheable(value = "devmastery:content:roadmap", key = "#slug + ':' + (#userId != null ? #userId : 'anonymous')", unless = "#result == null")
    public PathRoadmapResponse getPathRoadmap(String slug, UUID userId) {
        log.debug("Generating roadmap for path: {}, userId: {}", slug, userId);
        
        LearningPath path = cacheLoader.loadPath(slug);
        
        Map<String, Boolean> userProgress = new HashMap<>();
        if (userId != null) {
            try {
                userProgress.putAll(progressClient.getPathProgress(userId, slug));
            } catch (Exception e) {
                log.warn("Failed to fetch progress for user {} path {}, proceeding with empty progress", userId, slug);
                // Circuit breaker fallback: return empty map
            }
        }

        PathRoadmapResponse.PathSummaryDto pathSummary = PathRoadmapResponse.PathSummaryDto.builder()
                .slug(path.getSlug())
                .title(path.getTitle())
                .totalTopics(path.getTotalTopics())
                .build();

        // Group topics by level
        Map<Integer, List<Topic>> topicsByLevel = path.getTopics().stream()
                .filter(Topic::getIsPublished)
                .collect(Collectors.groupingBy(Topic::getLevel));

        List<PathRoadmapResponse.LevelRoadmapDto> levelRoadmaps = new ArrayList<>();
        
        // Ensure levels 1 to 5 are processed in order
        for (int level = 1; level <= 5; level++) {
            List<Topic> topics = topicsByLevel.getOrDefault(level, Collections.emptyList());
            if (topics.isEmpty()) continue;

            List<PathRoadmapResponse.TopicRoadmapDto> topicDtos = topics.stream()
                    .map(t -> PathRoadmapResponse.TopicRoadmapDto.builder()
                            .slug(t.getSlug())
                            .title(t.getTitle())
                            .estimatedMins(t.getEstimatedMins())
                            .hasVisualizer(t.getHasVisualizer())
                            .hasCodeLab(t.getHasCodeLab())
                            .completed(userProgress.getOrDefault(t.getSlug(), false))
                            .build())
                    .toList();

            long completedCount = topicDtos.stream().filter(PathRoadmapResponse.TopicRoadmapDto::isCompleted).count();

            levelRoadmaps.add(PathRoadmapResponse.LevelRoadmapDto.builder()
                    .level(level)
                    .label(getLevelLabel(level))
                    .topicCount(topics.size())
                    .completedCount((int) completedCount)
                    .topics(topicDtos)
                    .build());
        }

        return PathRoadmapResponse.builder()
                .path(pathSummary)
                .levels(levelRoadmaps)
                .build();
    }

    private String getLevelLabel(int level) {
        return switch (level) {
            case 1 -> "Foundation";
            case 2 -> "Beginner";
            case 3 -> "Intermediate";
            case 4 -> "Advanced";
            case 5 -> "Expert";
            default -> "Level " + level;
        };
    }
}
