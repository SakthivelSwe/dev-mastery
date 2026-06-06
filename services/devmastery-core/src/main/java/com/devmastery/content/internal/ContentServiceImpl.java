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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
class ContentServiceImpl implements ContentService, ContentCommandService {

    private final TopicRepository topics;
    private final LessonRepository lessons;
    private final LearningPathRepository paths;
    private final CodeExampleRepository codeExamples;
    private final LessonCompletionRepository completions;
    private final ExternalRunnerLinkBuilder runners;
    private final ApplicationEventPublisher events;

    ContentServiceImpl(TopicRepository topics, LessonRepository lessons,
                       LearningPathRepository paths, CodeExampleRepository codeExamples,
                       LessonCompletionRepository completions,
                       ExternalRunnerLinkBuilder runners,
                       ApplicationEventPublisher events) {
        this.topics = topics; this.lessons = lessons; this.paths = paths;
        this.codeExamples = codeExamples; this.completions = completions;
        this.runners = runners; this.events = events;
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
    @Cacheable(value = CacheNames.LESSONS_BY_TOPIC, key = "#topicId")
    public List<LessonView> getLessonsByTopic(UUID topicId) {
        return lessons.findByTopicIdOrderBySection(topicId).stream()
                .map(l -> new LessonView(l.getId(), l.getTopicId(), l.getSection(), l.getContent()))
                .toList();
    }

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
        Map<String, String> sections = new LinkedHashMap<>();
        sections.put("why", t.getWhy());
        sections.put("theory", t.getTheory());
        sections.put("visual", t.getVisual());
        sections.put("code", t.getCode());
        sections.put("real_world", t.getRealWorld());
        sections.put("interview", t.getInterview());
        sections.put("feynman", t.getFeynman());
        sections.put("build", t.getBuild());
        sections.put("spaced_review", t.getSpacedReview());

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
