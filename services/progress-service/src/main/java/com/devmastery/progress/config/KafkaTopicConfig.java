package com.devmastery.progress.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka topic declarations for DevMastery learning events.
 *
 * Topics are created on application startup if they don't exist.
 * Partition counts are sized for dev environment (1 replica).
 * In production, increase replicas to 3 and adjust partitions based on throughput.
 *
 * Partition rationale:
 *   - layer.completed, code.executed, xp.earned: 3 partitions (moderate traffic)
 *   - streak.updated, badge.earned: 1 partition (low frequency, ordering needed)
 */
@Configuration
public class KafkaTopicConfig {

    /** Fired when a user completes a learning layer (theory, code, etc.). */
    @Bean
    public NewTopic learningLayerCompletedTopic() {
        return TopicBuilder.name("learning.layer.completed")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /** Fired when a user runs code via the Code Lab. */
    @Bean
    public NewTopic learningCodeExecutedTopic() {
        return TopicBuilder.name("learning.code.executed")
                .partitions(3)
                .replicas(1)
                .build();
    }

    /** Fired when a user's daily learning streak changes. */
    @Bean
    public NewTopic learningStreakUpdatedTopic() {
        return TopicBuilder.name("learning.streak.updated")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /** Fired when a badge is awarded to a user. */
    @Bean
    public NewTopic learningBadgeEarnedTopic() {
        return TopicBuilder.name("learning.badge.earned")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /** Fired for every XP award event (most frequent). */
    @Bean
    public NewTopic learningXpEarnedTopic() {
        return TopicBuilder.name("learning.xp.earned")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
