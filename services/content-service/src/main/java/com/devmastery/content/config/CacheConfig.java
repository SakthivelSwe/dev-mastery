package com.devmastery.content.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Valkey (Redis-compatible) cache configuration.
 * spring-data-redis connects to Valkey without any code change — same protocol.
 *
 * Cache TTLs per spec:
 *   devmastery:content:topics  → 24h
 *   devmastery:content:lesson  → 6h
 *   devmastery:search:popular  → 1h
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${devmastery.cache.topics-ttl-hours:24}")
    private int topicsTtlHours;

    @Value("${devmastery.cache.lesson-ttl-hours:6}")
    private int lessonTtlHours;

    @Value("${devmastery.cache.search-popular-ttl-hours:1}")
    private int searchPopularTtlHours;

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        // Clone the objectMapper to avoid modifying the global one used by Spring MVC
        com.fasterxml.jackson.databind.ObjectMapper redisObjectMapper = objectMapper.copy();
        
        // Enable default typing for Redis so it stores class names
        redisObjectMapper.activateDefaultTyping(
                redisObjectMapper.getPolymorphicTypeValidator(),
                com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        );
        
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        // Default configuration: JSON serialization, no null values
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(serializer));

        // Per-cache TTL overrides
        Map<String, RedisCacheConfiguration> cacheConfigurations = Map.of(
                "devmastery:content:topics",
                defaultConfig.entryTtl(Duration.ofHours(topicsTtlHours)),

                "devmastery:content:lesson",
                defaultConfig.entryTtl(Duration.ofHours(lessonTtlHours)),

                "devmastery:search:popular",
                defaultConfig.entryTtl(Duration.ofHours(searchPopularTtlHours))
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig.entryTtl(Duration.ofHours(1)))
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
