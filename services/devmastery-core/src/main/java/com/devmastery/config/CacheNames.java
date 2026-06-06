package com.devmastery.config;

/**
 * Centralised cache name constants. Caffeine specs are configured in
 * {@code application.yml} under {@code spring.cache.caffeine.spec}.
 */
public final class CacheNames {
    private CacheNames() {}

    public static final String TOPICS_LIST       = "topicsList";       // 10 min
    public static final String TOPIC_BY_ID       = "topicById";        // 10 min
    public static final String TOPIC_BY_SLUG     = "topicBySlug";      // 10 min
    public static final String LESSONS_BY_TOPIC  = "lessonsByTopic";   // 10 min
    public static final String USER_PROGRESS     = "userProgress";     // 5  min
    public static final String PATHS_LIST        = "pathsList";        // 10 min
}
