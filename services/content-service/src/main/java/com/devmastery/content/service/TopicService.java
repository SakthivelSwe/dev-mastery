package com.devmastery.content.service;

import com.devmastery.content.cache.ContentCacheLoader;
import com.devmastery.content.dto.TopicResponse;
import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.mapper.TopicMapper;
import com.devmastery.content.repository.TopicRepository;
import com.devmastery.content.repository.TopicSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TopicService {

    private final ContentCacheLoader cacheLoader;   // Separate component — proxy works
    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    /**
     * GET /v1/topics — paginated, filterable list.
     * Not cached (dynamic filters), but individual topic detail is cached.
     */
    public Page<TopicSummaryResponse> getTopics(
            String pathSlug, Integer level, Boolean hasVisualizer, List<String> tags,
            int page, int size) {
        log.debug("Listing topics: pathSlug={}, level={}, hasVisualizer={}, tags={}", pathSlug, level, hasVisualizer, tags);
        var pageable = PageRequest.of(page, size, Sort.by("learningPath.orderIndex", "orderIndex"));
        return topicRepository
                .findAll(TopicSpecification.buildSpecification(pathSlug, level, hasVisualizer, tags), pageable)
                .map(topicMapper::toSummary);
    }

    /**
     * GET /v1/topics/{slug} — full topic detail with all lessons and code examples.
     * Cached in Valkey: devmastery:content:lesson:{slug} TTL 6h.
     */
    public TopicResponse getTopic(String slug) {
        log.debug("Loading topic detail: {}", slug);
        // cacheLoader.loadTopic() — proxied @Cacheable, cache checked first
        var topic = cacheLoader.loadTopic(slug);
        return topicMapper.toResponse(topic);
    }
}
