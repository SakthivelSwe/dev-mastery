package com.devmastery.content.service;

import com.devmastery.content.dto.LessonResponse;
import com.devmastery.content.mapper.TopicMapper;
import com.devmastery.content.repository.LessonRepository;
import com.devmastery.content.repository.TopicRepository;
import com.devmastery.content.exception.TopicNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LessonService {

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    /**
     * GET /v1/topics/{slug}/lessons — all published lessons for a topic.
     * Ordered by order_index (why → theory → visual → code → realworld → interview).
     */
    public List<LessonResponse> getLessonsForTopic(String topicSlug) {
        log.debug("Loading lessons for topic: {}", topicSlug);
        var topic = topicRepository.findBySlug(topicSlug)
                .orElseThrow(() -> new TopicNotFoundException(topicSlug));
        var lessons = lessonRepository.findByTopicIdAndIsPublishedTrueOrderByOrderIndexAsc(topic.getId());
        return topicMapper.toLessonResponseList(lessons);
    }
}
