package com.devmastery.progress.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * LearningEventProducer — publishes LearningEvent messages to Kafka.
 *
 * Partition key: userId — ensures all events for the same user are ordered
 * within a partition, which is important for streak and XP calculation.
 *
 * On failure: logs the error but does NOT throw — event publishing is
 * fire-and-forget. The caller should not fail because Kafka is down.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LearningEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // ─── Topic name constants ─────────────────────────────────────────────────
    private static final String TOPIC_LAYER_COMPLETED = "learning.layer.completed";
    private static final String TOPIC_CODE_EXECUTED   = "learning.code.executed";
    private static final String TOPIC_STREAK_UPDATED  = "learning.streak.updated";
    private static final String TOPIC_BADGE_EARNED    = "learning.badge.earned";
    private static final String TOPIC_XP_EARNED       = "learning.xp.earned";

    /**
     * Publish a LAYER_COMPLETED event.
     * Called when a user marks a layer as done via the progress service API.
     */
    public void publishLayerCompleted(String userId, String topicSlug, String pathSlug,
                                      String layerName, int xpEarned) {
        LearningEvent event = LearningEvent.layerCompleted(userId, topicSlug, pathSlug, layerName, xpEarned);
        send(TOPIC_LAYER_COMPLETED, userId, event);
    }

    /**
     * Publish a CODE_EXECUTED event.
     * Called by the execution service result webhook / Code Lab run.
     */
    public void publishCodeExecuted(String userId, String topicSlug, String tier,
                                    String language, boolean success) {
        LearningEvent event = LearningEvent.codeExecuted(userId, topicSlug, tier, language, success);
        send(TOPIC_CODE_EXECUTED, userId, event);
    }

    /**
     * Publish a STREAK_UPDATED event.
     * Called by the streak calculation job (daily cron).
     */
    public void publishStreakUpdated(String userId, int newStreak, boolean broken) {
        LearningEvent event = LearningEvent.streakUpdated(userId, newStreak, broken);
        send(TOPIC_STREAK_UPDATED, userId, event);
    }

    /**
     * Publish a BADGE_EARNED event.
     * Called by the badge evaluation service after criteria are met.
     */
    public void publishBadgeEarned(String userId, String badgeName, int xpAwarded) {
        LearningEvent event = LearningEvent.badgeEarned(userId, badgeName, xpAwarded);
        send(TOPIC_BADGE_EARNED, userId, event);
    }

    /**
     * Publish an XP_EARNED event.
     * Called for every XP award: layer complete, code run, badge, streak, etc.
     */
    public void publishXpEarned(String userId, int amount, String reason) {
        LearningEvent event = LearningEvent.xpEarned(userId, amount, reason);
        send(TOPIC_XP_EARNED, userId, event);
    }

    // ─── Internal send helper ─────────────────────────────────────────────────
    private void send(String topic, String key, LearningEvent event) {
        CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(topic, key, event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish {} event for user {} to topic {}: {}",
                        event.eventType(), key, topic, ex.getMessage());
            } else {
                log.debug("Published {} event for user {} → {}@{}",
                        event.eventType(), key, topic,
                        result.getRecordMetadata().offset());
            }
        });
    }
}
