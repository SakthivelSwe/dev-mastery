package com.devmastery.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Notifies THE SYSTEM (solo-leveling) when a user completes a topic in DevMastery.
 *
 * This service is fire-and-forget (@Async) — DevMastery's own request/transaction
 * is NOT affected if THE SYSTEM webhook fails. Errors are logged but not re-thrown.
 *
 * Configuration (add to application.yml / env vars):
 *   solo-leveling.webhook-url     — THE SYSTEM backend URL + /api/devmastery/webhook
 *   solo-leveling.webhook-secret  — shared secret (same value as thesystem.devmastery.webhook-secret)
 *
 * To disable: leave solo-leveling.webhook-url blank (feature-flagged).
 */
@Service
public class SoloLevelingWebhookService {

    private static final Logger log = LoggerFactory.getLogger(SoloLevelingWebhookService.class);

    @Value("${solo-leveling.webhook-url:}")
    private String webhookUrl;

    @Value("${solo-leveling.webhook-secret:}")
    private String webhookSecret;

    private final RestClient http = RestClient.create();

    /**
     * Fires the Solo Leveling webhook asynchronously after a topic is completed.
     */
    @Async
    public void notifyTopicCompleted(String userEmail, UUID topicId, String topicTitle, UUID pathId, int xpEarned) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.debug("Solo Leveling webhook not configured — skipping notification");
            return;
        }

        Map<String, Object> payload = Map.of(
            "email",      userEmail,
            "topicId",    topicId.toString(),
            "topicTitle", topicTitle,
            "pathSlug",   pathId != null ? pathId.toString() : "",
            "xpEarned",   xpEarned,
            "timestamp",  Instant.now().toString()
        );

        try {
            http.post()
                .uri(webhookUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("X-Webhook-Secret", webhookSecret)
                .body(payload)
                .retrieve()
                .toBodilessEntity();

            log.info("Solo Leveling webhook fired: user={} topic={}", userEmail, topicTitle);
        } catch (RestClientException e) {
            // Non-fatal — log and continue
            log.warn("Solo Leveling webhook failed for topic {}: {}", topicTitle, e.getMessage());
        }
    }
}
