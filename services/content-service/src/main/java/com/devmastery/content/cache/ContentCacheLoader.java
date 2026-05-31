package com.devmastery.content.cache;

import com.devmastery.content.entity.LearningPath;
import com.devmastery.content.entity.Topic;
import com.devmastery.content.exception.PathNotFoundException;
import com.devmastery.content.exception.TopicNotFoundException;
import com.devmastery.content.repository.LearningPathRepository;
import com.devmastery.content.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

/**
 * Dedicated cache loader component — CRITICAL PATTERN from spec.
 *
 * WHY this exists: Spring @Cacheable uses AOP proxies. If TopicService
 * calls its OWN @Cacheable method (self-invocation), the proxy is bypassed
 * and the cache is NEVER populated. By delegating to this separate
 * @Component, the Spring proxy always intercepts the call correctly.
 *
 * Pattern: Service → TopicCacheLoader.loadX() → DB
 *                   ↑ proxy intercepts here, checks/populates cache
 *
 * Cache names match the spec's Valkey key schema:
 *   devmastery:content:topics   TTL 24h
 *   devmastery:content:lesson   TTL 6h  (keyed by slug)
 */
@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentCacheLoader {

    private final LearningPathRepository pathRepository;
    private final TopicRepository topicRepository;

    // ─── Learning Paths ─────────────────────────────────────────

    @Cacheable(value = "devmastery:content:topics", key = "'all-paths'")
    public List<LearningPath> loadAllPaths() {
        return pathRepository.findAllActive();
    }

    // NOT cached — caching raw Hibernate entities causes LazyInitializationException
    // on Redis deserialize because PersistentBag proxies are serialized but can't
    // be re-attached to a session. Cache the DTO in PathRoadmapService instead.
    public LearningPath loadPath(String slug) {
        LearningPath path = pathRepository.findBySlug(slug)
                .orElseThrow(() -> new PathNotFoundException(slug));
        Hibernate.initialize(path.getTopics());
        return path;
    }

    @CacheEvict(value = "devmastery:content:topics", allEntries = true)
    public void evictAllPathCaches() {
        // triggered after admin path updates
    }

    // ─── Topics ─────────────────────────────────────────────────

    /**
     * Cache key: devmastery:content:lesson:{slug}
     * TTL: 6h (configured in CacheConfig per cache name)
     */
    @Cacheable(value = "devmastery:content:lesson", key = "#slug")
    public Topic loadTopic(String slug) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));
        Hibernate.initialize(topic.getLessons());
        Hibernate.initialize(topic.getCodeExamples());
        return topic;
    }

    @CacheEvict(value = "devmastery:content:lesson", key = "#slug")
    public void evictTopic(String slug) {
        // triggered after admin topic updates
    }
}
