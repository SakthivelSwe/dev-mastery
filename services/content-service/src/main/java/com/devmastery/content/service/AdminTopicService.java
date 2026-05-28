package com.devmastery.content.service;

import com.devmastery.content.dto.admin.*;
import com.devmastery.content.entity.LearningPath;
import com.devmastery.content.entity.Lesson;
import com.devmastery.content.entity.Topic;
import com.devmastery.content.exception.PathNotFoundException;
import com.devmastery.content.exception.TopicNotFoundException;
import com.devmastery.content.repository.LearningPathRepository;
import com.devmastery.content.repository.LessonRepository;
import com.devmastery.content.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTopicService {

    private final TopicRepository topicRepository;
    private final LearningPathRepository pathRepository;
    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public AdminTopicStatsResponse getStats() {
        List<LearningPath> paths = pathRepository.findAllActive();
        List<AdminTopicStatsItem> items = new ArrayList<>();
        
        long totalTopics = 0;
        long totalPublished = 0;
        long totalDrafts = 0;
        long totalNeedingContent = 0;

        for (LearningPath path : paths) {
            List<Topic> allTopics = topicRepository.findAll().stream()
                .filter(t -> t.getLearningPath().getId().equals(path.getId()))
                .toList();

            long pathTotal = allTopics.size();
            long pathPublished = allTopics.stream().filter(Topic::getIsPublished).count();
            long pathDrafts = pathTotal - pathPublished;
            long pathNeedingContent = allTopics.stream().filter(t -> {
                return t.getLessons().isEmpty() || t.getLessons().stream().anyMatch(l -> l.getContentMdx() == null || l.getContentMdx().trim().isEmpty());
            }).count();

            totalTopics += pathTotal;
            totalPublished += pathPublished;
            totalDrafts += pathDrafts;
            totalNeedingContent += pathNeedingContent;

            items.add(new AdminTopicStatsItem(
                    path.getSlug(),
                    path.getTitle(),
                    pathTotal,
                    pathPublished,
                    pathDrafts,
                    pathNeedingContent
            ));
        }

        return new AdminTopicStatsResponse(totalTopics, totalPublished, totalDrafts, totalNeedingContent, items);
    }

    @Transactional(readOnly = true)
    public List<AdminTopicSummaryResponse> getTopicsForPath(String pathSlug) {
        LearningPath path = pathRepository.findBySlug(pathSlug)
                .orElseThrow(() -> new PathNotFoundException(pathSlug));
                
        List<Topic> topics = topicRepository.findAll().stream()
                .filter(t -> t.getLearningPath().getId().equals(path.getId()))
                .sorted((t1, t2) -> t1.getOrderIndex().compareTo(t2.getOrderIndex()))
                .toList();

        return topics.stream().map(t -> {
            int wordCount = t.getLessons().stream()
                    .mapToInt(l -> l.getContentMdx() != null ? l.getContentMdx().split("\\s+").length : 0)
                    .sum();
            boolean hasContent = wordCount > 0;
            
            return AdminTopicSummaryResponse.builder()
                    .id(t.getId())
                    .slug(t.getSlug())
                    .title(t.getTitle())
                    .level(t.getLevel())
                    .orderIndex(t.getOrderIndex())
                    .hasVisualizer(t.getHasVisualizer())
                    .hasCodeLab(t.getHasCodeLab())
                    .isPublished(t.getIsPublished())
                    .wordCount(wordCount)
                    .hasContent(hasContent)
                    .updatedAt(t.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateSection(String slug, AdminSectionDraftRequest request) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        Lesson.SectionType type = Lesson.SectionType.valueOf(request.sectionType().toLowerCase());
        
        Lesson lesson = topic.getLessons().stream()
                .filter(l -> l.getSectionType() == type)
                .findFirst()
                .orElseGet(() -> {
                    Lesson newLesson = new Lesson();
                    newLesson.setTopic(topic);
                    newLesson.setSectionType(type);
                    newLesson.setTitle(type.name().toUpperCase());
                    newLesson.setOrderIndex(type.ordinal());
                    topic.getLessons().add(newLesson);
                    return newLesson;
                });

        lesson.setContentMdx(request.contentMdx());
        lessonRepository.save(lesson);
    }

    @Transactional
    public void updateDraft(String slug, AdminTopicDraftRequest request) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        topic.setTitle(request.title());
        topic.setSlug(request.slug());
        if (request.level() != null) topic.setLevel(request.level());
        if (request.estimatedMins() != null) topic.setEstimatedMins(request.estimatedMins());
        if (request.hasVisualizer() != null) topic.setHasVisualizer(request.hasVisualizer());
        if (request.hasCodeLab() != null) topic.setHasCodeLab(request.hasCodeLab());
        if (request.tags() != null) topic.setTags(request.tags().toArray(new String[0]));

        if (request.sections() != null) {
            for (AdminSectionDraftRequest sectionRequest : request.sections()) {
                Lesson.SectionType type = Lesson.SectionType.valueOf(sectionRequest.sectionType().toLowerCase());
                Lesson lesson = topic.getLessons().stream()
                        .filter(l -> l.getSectionType() == type)
                        .findFirst()
                        .orElseGet(() -> {
                            Lesson newLesson = new Lesson();
                            newLesson.setTopic(topic);
                            newLesson.setSectionType(type);
                            newLesson.setTitle(type.name().toUpperCase());
                            newLesson.setOrderIndex(type.ordinal());
                            topic.getLessons().add(newLesson);
                            return newLesson;
                        });
                lesson.setContentMdx(sectionRequest.contentMdx());
            }
        }
        topicRepository.save(topic);
    }

    @Transactional
    public void importSections(String slug, AdminTopicSectionsImportRequest request) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        updateOrCreateLesson(topic, Lesson.SectionType.why, request.why());
        updateOrCreateLesson(topic, Lesson.SectionType.theory, request.theory());
        updateOrCreateLesson(topic, Lesson.SectionType.visual, request.visual());
        updateOrCreateLesson(topic, Lesson.SectionType.code, request.code());
        updateOrCreateLesson(topic, Lesson.SectionType.realworld, request.realWorld());
        updateOrCreateLesson(topic, Lesson.SectionType.interview, request.interview());
        updateOrCreateLesson(topic, Lesson.SectionType.feynman, request.feynman());
        updateOrCreateLesson(topic, Lesson.SectionType.build, request.build());
        updateOrCreateLesson(topic, Lesson.SectionType.spacedreview, request.spacedReview());

        topicRepository.save(topic);
    }

    private void updateOrCreateLesson(Topic topic, Lesson.SectionType type, String content) {
        if (content == null || content.trim().isEmpty()) {
            return;
        }
        Lesson lesson = topic.getLessons().stream()
                .filter(l -> l.getSectionType() == type)
                .findFirst()
                .orElseGet(() -> {
                    Lesson newLesson = new Lesson();
                    newLesson.setTopic(topic);
                    newLesson.setSectionType(type);
                    newLesson.setTitle(type.name().toUpperCase());
                    newLesson.setOrderIndex(type.ordinal());
                    topic.getLessons().add(newLesson);
                    return newLesson;
                });
        lesson.setContentMdx(content);
        lessonRepository.save(lesson);
    }

    @Transactional
    public void batchImport(AdminTopicBatchImportRequest request) {
        for (AdminTopicBatchImportRequest.TopicImport topicImport : request.topics()) {
            try {
                importSections(topicImport.slug(), topicImport.layers());
            } catch (TopicNotFoundException e) {
                // Log and continue
                System.err.println("Batch import warning: Topic not found for slug: " + topicImport.slug());
            }
        }
    }

    @Transactional(readOnly = true)
    public ValidationReport validateSections(String slug, AdminTopicSectionsImportRequest request) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        java.util.Map<String, ValidationReport.SectionValidation> sectionsMap = new java.util.HashMap<>();
        int totalWordCount = 0;
        boolean allValid = true;

        totalWordCount += validateSectionContent("why", request.why(), 100, sectionsMap);
        totalWordCount += validateSectionContent("theory", request.theory(), 300, sectionsMap);
        totalWordCount += validateSectionContent("visual", request.visual(), 0, sectionsMap); // Visualizer config can be short
        totalWordCount += validateSectionContent("code", request.code(), 200, sectionsMap);
        totalWordCount += validateSectionContent("realworld", request.realWorld(), 150, sectionsMap);
        totalWordCount += validateSectionContent("interview", request.interview(), 200, sectionsMap);
        totalWordCount += validateSectionContent("feynman", request.feynman(), 50, sectionsMap);
        totalWordCount += validateSectionContent("build", request.build(), 50, sectionsMap);
        totalWordCount += validateSectionContent("spacedreview", request.spacedReview(), 50, sectionsMap);

        for (ValidationReport.SectionValidation validation : sectionsMap.values()) {
            if (!validation.warnings().isEmpty()) {
                allValid = false;
            }
        }

        return new ValidationReport(slug, allValid, totalWordCount, sectionsMap);
    }

    private int validateSectionContent(String name, String content, int minWords, java.util.Map<String, ValidationReport.SectionValidation> map) {
        if (content == null || content.trim().isEmpty()) {
            map.put(name, new ValidationReport.SectionValidation(0, false, List.of("Missing content")));
            return 0;
        }

        int wordCount = content.split("\\s+").length;
        List<String> warnings = new ArrayList<>();
        if (wordCount < minWords) {
            warnings.add("Word count too low. Found " + wordCount + ", expected at least " + minWords);
        }

        map.put(name, new ValidationReport.SectionValidation(wordCount, true, warnings));
        return wordCount;
    }

    @Transactional
    public void publishTopic(String slug) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));
        topic.setIsPublished(true);
        topic.getLessons().forEach(l -> l.setIsPublished(true));
        topicRepository.save(topic);
    }

    @Transactional
    public void unpublishTopic(String slug) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));
        topic.setIsPublished(false);
        topic.getLessons().forEach(l -> l.setIsPublished(false));
        topicRepository.save(topic);
    }

    @Transactional
    public void createTopic(AdminTopicCreateRequest request) {
        LearningPath path = pathRepository.findById(request.pathId())
                .orElseThrow(() -> new RuntimeException("Path not found"));
        
        if (topicRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Topic with slug already exists: " + request.slug());
        }

        Topic topic = new Topic();
        topic.setLearningPath(path);
        topic.setTitle(request.title());
        topic.setSlug(request.slug());
        topic.setLevel(request.level());
        topic.setOrderIndex(request.orderIndex());
        topic.setEstimatedMins(30);
        
        topicRepository.save(topic);
    }
}
