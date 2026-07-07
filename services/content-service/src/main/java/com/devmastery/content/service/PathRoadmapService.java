package com.devmastery.content.service;

import com.devmastery.content.cache.ContentCacheLoader;
import com.devmastery.content.dto.PathRoadmapResponse;
import com.devmastery.content.entity.LearningPath;
import com.devmastery.content.entity.Topic;
import com.devmastery.content.repository.TopicRepository;
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
    private final TopicRepository topicRepository;

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

        // ── Load topics via topic_paths junction (supports cross-listed topics) ──
        // Fallback: if the junction returns nothing (e.g. table not yet backfilled),
        // fall back to the JPA @OneToMany relationship so nothing regresses.
        List<Object[]> junctionRows = topicRepository.findJunctionRowsByPathSlug(slug);
        List<Topic> topics;
        Map<UUID, Integer> levelOverrides = new HashMap<>();
        Map<UUID, Integer> displayOrders = new HashMap<>();

        if (junctionRows != null && !junctionRows.isEmpty()) {
            List<UUID> ids = new ArrayList<>(junctionRows.size());
            for (Object[] row : junctionRows) {
                UUID topicId = (UUID) row[0];
                Integer lvl = row[1] == null ? null : ((Number) row[1]).intValue();
                Integer ord = row[2] == null ? null : ((Number) row[2]).intValue();
                ids.add(topicId);
                if (lvl != null) levelOverrides.put(topicId, lvl);
                if (ord != null) displayOrders.put(topicId, ord);
            }
            // Preserve junction ordering by index map — findAllById does not guarantee order
            Map<UUID, Integer> position = new HashMap<>();
            for (int i = 0; i < ids.size(); i++) position.put(ids.get(i), i);

            List<Topic> loaded = topicRepository.findAllById(ids);
            loaded.sort(Comparator.comparingInt(t -> position.getOrDefault(t.getId(), Integer.MAX_VALUE)));
            topics = loaded.stream().filter(Topic::getIsPublished).toList();
        } else {
            log.debug("Junction empty for path {} — falling back to @OneToMany relationship", slug);
            topics = path.getTopics().stream().filter(Topic::getIsPublished).toList();
        }

        PathRoadmapResponse.PathSummaryDto pathSummary = PathRoadmapResponse.PathSummaryDto.builder()
                .slug(path.getSlug())
                .title(path.getTitle())
                .totalTopics(topics.size())
                .build();

        // Group topics by level (honor level_override from topic_paths when present)
        Map<Integer, List<Topic>> topicsByLevel = topics.stream()
                .collect(Collectors.groupingBy(
                        t -> levelOverrides.getOrDefault(t.getId(), t.getLevel()),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<PathRoadmapResponse.LevelRoadmapDto> levelRoadmaps = new ArrayList<>();

        // Ensure levels 1 to 5 are processed in order
        for (int level = 1; level <= 5; level++) {
            List<Topic> levelTopics = topicsByLevel.getOrDefault(level, Collections.emptyList());
            if (levelTopics.isEmpty()) continue;

            List<PathRoadmapResponse.TopicRoadmapDto> topicDtos = levelTopics.stream()
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
                    .topicCount(levelTopics.size())
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
