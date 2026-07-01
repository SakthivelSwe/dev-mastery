package com.devmastery.content.internal;

import com.devmastery.common.events.LessonCompletedEvent;
import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.config.CacheNames;
import com.devmastery.content.api.ContentCommandService;
import com.devmastery.content.api.ContentService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
class ContentServiceImpl implements ContentService, ContentCommandService {

    private static final Map<Integer, String> LEVEL_LABELS = Map.of(
            1, "Foundation",
            2, "Working Knowledge",
            3, "Practitioner",
            4, "Advanced",
            5, "Expert"
    );

    private final TopicRepository topics;
    private final LessonRepository lessons;
    private final LearningPathRepository paths;
    private final CodeExampleRepository codeExamples;
    private final LessonCompletionRepository completions;
    private final ExternalRunnerLinkBuilder runners;
    private final ApplicationEventPublisher events;
    private final JdbcTemplate jdbc;

    ContentServiceImpl(TopicRepository topics, LessonRepository lessons,
                       LearningPathRepository paths, CodeExampleRepository codeExamples,
                       LessonCompletionRepository completions,
                       ExternalRunnerLinkBuilder runners,
                       ApplicationEventPublisher events,
                       JdbcTemplate jdbc) {
        this.topics = topics; this.lessons = lessons; this.paths = paths;
        this.codeExamples = codeExamples; this.completions = completions;
        this.runners = runners; this.events = events; this.jdbc = jdbc;
    }

    @Override
    @Cacheable(value = CacheNames.TOPICS_LIST, key = "T(java.util.Objects).hash(#pathSlug,#level,#page,#size)")
    public List<TopicSummary> listTopics(String pathSlug, Integer level, int page, int size) {
        UUID pathId = pathSlug == null ? null
                : paths.findBySlug(pathSlug).map(LearningPathEntity::getId).orElse(null);
        return topics.search(pathId, level, PageRequest.of(page, size))
                .stream().map(this::toSummary).toList();
    }

    @Override
    @Cacheable(value = CacheNames.TOPIC_BY_SLUG, key = "#slug")
    public TopicDetail getTopicBySlug(String slug) {
        TopicEntity t = topics.findBySlugAndStatus(slug, "published")
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + slug));
        return toDetail(t);
    }

    @Override
    @Cacheable(value = CacheNames.PATHS_LIST)
    public List<PathSummary> listPaths() {
        return paths.findAll().stream()
                .map(p -> new PathSummary(p.getId(), p.getSlug(), p.getTitle(),
                        p.getDescription(), p.getIcon()))
                .toList();
    }

    @Override
    public PathDetail getPathBySlug(String slug) {
        LearningPathEntity p = paths.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Path not found: " + slug));
        var summaries = topics.search(p.getId(), null, PageRequest.of(0, 200))
                .stream().map(this::toSummary).toList();
        return new PathDetail(p.getId(), p.getSlug(), p.getTitle(), p.getDescription(), summaries);
    }

    @Override
    public PathRoadmap getPathRoadmap(String slug, UUID userId) {
        LearningPathEntity p = paths.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Path not found: " + slug));

        List<TopicEntity> all =
                topics.findByPathIdAndPublishedTrueOrderByDisplayOrder(p.getId());

        Set<UUID> completedIds = userId == null ? Set.of() : completedTopicIds(userId, p.getId());

        // group by level (1..5), preserving display order inside each group
        Map<Integer, List<TopicEntity>> byLevel = all.stream()
                .collect(Collectors.groupingBy(TopicEntity::getLevel,
                        LinkedHashMap::new, Collectors.toList()));

        List<LevelGroup> levels = new ArrayList<>();
        for (int lvl = 1; lvl <= 5; lvl++) {
            List<TopicEntity> bucket = byLevel.getOrDefault(lvl, List.of());
            if (bucket.isEmpty()) continue;
            int completedCount = 0;
            List<TopicRoadmap> mapped = new ArrayList<>(bucket.size());
            for (TopicEntity t : bucket) {
                boolean done = completedIds.contains(t.getId());
                if (done) completedCount++;
                mapped.add(new TopicRoadmap(t.getSlug(), t.getTitle(),
                        t.getEstimatedMins(), done,
                        t.isHasVisualizer(), t.isHasCodeLab()));
            }
            levels.add(new LevelGroup(lvl, LEVEL_LABELS.getOrDefault(lvl, "Level " + lvl),
                    bucket.size(), completedCount, mapped));
        }

        return new PathRoadmap(
                new PathHeader(p.getSlug(), p.getTitle(), all.size()),
                levels);
    }

    /** Returns the set of topic ids that the given user has completed (status='completed'). */
    private Set<UUID> completedTopicIds(UUID userId, UUID pathId) {
        try {
            List<UUID> ids = jdbc.query(
                    """
                    select up.topic_id
                      from user_progress up
                      join topics t on t.id = up.topic_id
                     where up.user_id = ?
                       and up.status  = 'completed'
                       and t.path_id  = ?
                    """,
                    (rs, i) -> (UUID) rs.getObject("topic_id"),
                    userId, pathId);
            return new HashSet<>(ids);
        } catch (Exception ignored) {
            // user_progress missing or query failure → treat as no completions
            return Set.of();
        }
    }

    @Override
    @Cacheable(value = CacheNames.LESSONS_BY_TOPIC, key = "#topicId")
    public List<LessonView> getLessonsByTopic(UUID topicId) {
        return lessons.findByTopicIdOrderBySection(topicId).stream()
                .map(l -> new LessonView(l.getId(), l.getTopicId(), l.getSection(), l.getContent()))
                .toList();
    }

    private static final List<String> VALID_SECTIONS = List.of(
            "why", "theory", "visual", "code",
            "realworld", "interview", "feynman", "build", "spacedreview");

    /** Normalise incoming section key to canonical DB value. */
    private static String normaliseSection(String raw) {
        if (raw == null) return "";
        String s = raw.toLowerCase().replace("-", "").replace("_", "").replace(" ", "");
        return switch (s) {
            case "realworld"    -> "realworld";
            case "spacedreview" -> "spacedreview";
            default             -> raw.toLowerCase().replace("-", "_").replace(" ", "_");
        };
    }

    @Override
    @Transactional
    public void upsertTopicSection(String topicSlug, String sectionType, String content) {
        String section = normaliseSection(sectionType);
        topics.findBySlug(topicSlug).ifPresent(topic -> {
            LessonEntity lesson = lessons
                    .findByTopicIdAndSection(topic.getId(), section)
                    .orElseGet(() -> LessonEntity.builder()
                            .topicId(topic.getId())
                            .section(section)
                            .title(sectionTitle(section))
                            .orderIndex(sectionOrder(section))
                            .build());
            lesson.setContent(content);
            lessons.save(lesson);
        });
    }

    @Override
    @Transactional
    public void importTopicLayers(List<ContentCommandService.TopicImport> topicImports) {
        int saved = 0, skipped = 0;
        for (var ti : topicImports) {
            var topicOpt = topics.findBySlug(ti.slug());
            if (topicOpt.isEmpty()) { skipped++; continue; }
            var topic = topicOpt.get();
            if (ti.layers() == null) continue;
            for (var entry : ti.layers().entrySet()) {
                String section = normaliseSection(entry.getKey());
                String mdx     = entry.getValue();
                if (!VALID_SECTIONS.contains(section) || mdx == null || mdx.isBlank()) continue;
                LessonEntity lesson = lessons
                        .findByTopicIdAndSection(topic.getId(), section)
                        .orElseGet(() -> LessonEntity.builder()
                                .topicId(topic.getId())
                                .section(section)
                                .title(sectionTitle(section))
                                .orderIndex(sectionOrder(section))
                                .build());
                lesson.setContent(mdx);
                lessons.save(lesson);
                saved++;
            }
        }
        log.info("importTopicLayers: {} sections saved, {} slugs skipped", saved, skipped);
    }

    /** Returns a human-readable title for each section type. */
    private static String sectionTitle(String section) {
        return switch (section) {
            case "why"          -> "Why It Matters";
            case "theory"       -> "Theory & Deep Dive";
            case "visual"       -> "Visualization";
            case "code"         -> "Code Examples";
            case "realworld"    -> "Real World Applications";
            case "interview"    -> "Interview Questions";
            case "feynman"      -> "Feynman Check";
            case "build"        -> "Build Challenge";
            case "spacedreview" -> "Spaced Review";
            default             -> section;
        };
    }

    /** Returns the display order index for each section type. */
    private static int sectionOrder(String section) {
        return switch (section) {
            case "why"          -> 1;
            case "theory"       -> 2;
            case "visual"       -> 3;
            case "code"         -> 4;
            case "realworld"    -> 5;
            case "interview"    -> 6;
            case "feynman"      -> 7;
            case "build"        -> 8;
            case "spacedreview" -> 9;
            default             -> 10;
        };
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(ContentServiceImpl.class);

    @Override
    @Transactional
    @CacheEvict(value = CacheNames.USER_PROGRESS, allEntries = true)
    public void completeLesson(UUID userId, UUID lessonId) {
        LessonEntity lesson = lessons.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        if (completions.findByUserIdAndLessonId(userId, lessonId).isEmpty()) {
            completions.save(LessonCompletionEntity.builder()
                    .userId(userId).lessonId(lessonId).build());
        }
        events.publishEvent(new LessonCompletedEvent(
                userId, lessonId, lesson.getTopicId(), Instant.now()));
    }

    // ─── mappers ───────────────────────────────────────────

    private TopicSummary toSummary(TopicEntity t) {
        return new TopicSummary(t.getId(), t.getSlug(), t.getTitle(), t.getLevel(),
                t.getXpReward(), t.getEstimatedMins(),
                t.getTags() == null ? List.of() : t.getTags());
    }

    private TopicDetail toDetail(TopicEntity t) {
        // Populate per-layer MDX content from the `lessons` table (column section_type → content_mdx).
        Map<String, String> sections = new LinkedHashMap<>();
        sections.put("why", null);
        sections.put("theory", null);
        sections.put("visual", null);
        sections.put("code", null);
        sections.put("real_world", null);
        sections.put("interview", null);
        sections.put("feynman", null);
        sections.put("build", null);
        sections.put("spaced_review", null);
        for (LessonEntity l : lessons.findByTopicIdOrderBySection(t.getId())) {
            // Normalise legacy section names (e.g. "realworld" → "real_world", "spacedreview" → "spaced_review")
            String key = switch (l.getSection() == null ? "" : l.getSection().toLowerCase()) {
                case "realworld", "real-world" -> "real_world";
                case "spacedreview", "spaced-review" -> "spaced_review";
                default -> l.getSection() == null ? "" : l.getSection().toLowerCase();
            };
            if (sections.containsKey(key)) sections.put(key, l.getContent());
        }

        var examples = codeExamples.findByTopicId(t.getId()).stream()
                .map(c -> new CodeExampleView(c.getId(), c.getLanguage(), c.getCode(),
                        c.getExplanation(), c.getExpectedOutput(),
                        runners.build(c.getLanguage(), c.getCode())))
                .toList();

        return new TopicDetail(t.getId(), t.getSlug(), t.getTitle(), t.getLevel(),
                t.getXpReward(), sections, examples,
                t.getTags() == null ? List.of() : t.getTags());
    }
}
