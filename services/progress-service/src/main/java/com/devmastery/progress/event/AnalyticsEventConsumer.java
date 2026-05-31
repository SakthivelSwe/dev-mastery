package com.devmastery.progress.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * AnalyticsEventConsumer — processes learning events for analytics.
 *
 * This consumer belongs to the "analytics-group" consumer group,
 * which means each event is processed by exactly one instance of this service.
 *
 * Current analytics recorded:
 *   - daily_stats.completed_layers_count (upserted per userId + date)
 *   - daily_stats.code_runs_count + success_count
 *
 * Note: In a real production setup, this would upsert into a daily_stats table.
 * The actual repository injection is left as a TODO for when that table is created.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsEventConsumer {

    /**
     * Handles LAYER_COMPLETED events.
     * Updates daily_stats: increments completed_layers_count for userId + today's date.
     *
     * Kafka consumer group: analytics-group
     * Partition assignment: auto (round-robin across 3 partitions)
     */
    @KafkaListener(
        topics  = "learning.layer.completed",
        groupId = "analytics-group",
        containerFactory = "learningEventListenerFactory"
    )
    public void onLayerCompleted(LearningEvent event) {
        try {
            log.info("Analytics: LAYER_COMPLETED — user={} topic={} layer={} xp={}",
                    event.userId(), event.topicSlug(), event.layerName(),
                    event.metadata().get("xpEarned"));

            // TODO: upsert into daily_stats table
            // dailyStatsRepository.incrementLayersCompleted(event.userId(), LocalDate.now());
        } catch (Exception e) {
            log.error("Failed to process LAYER_COMPLETED event for user {}: {}", event.userId(), e.getMessage());
            // Do NOT rethrow — let Kafka commit the offset to avoid infinite retry loop.
            // Dead-letter queue (DLQ) handling would be added here for production.
        }
    }

    /**
     * Handles CODE_EXECUTED events.
     * Updates daily_stats: increments code_runs_count and (if success) success_count.
     *
     * Kafka consumer group: analytics-group
     */
    @KafkaListener(
        topics  = "learning.code.executed",
        groupId = "analytics-group",
        containerFactory = "learningEventListenerFactory"
    )
    public void onCodeExecuted(LearningEvent event) {
        try {
            boolean success = Boolean.TRUE.equals(event.metadata().get("success"));
            log.info("Analytics: CODE_EXECUTED — user={} topic={} lang={} success={}",
                    event.userId(), event.topicSlug(),
                    event.metadata().get("language"), success);

            // TODO: upsert into daily_stats table
            // dailyStatsRepository.incrementCodeRuns(event.userId(), LocalDate.now(), success);
        } catch (Exception e) {
            log.error("Failed to process CODE_EXECUTED event for user {}: {}", event.userId(), e.getMessage());
        }
    }
}
