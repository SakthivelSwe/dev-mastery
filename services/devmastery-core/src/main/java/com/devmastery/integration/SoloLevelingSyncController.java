package com.devmastery.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Endpoint for THE SYSTEM to pull historical DevMastery progress (Manual Sync).
 */
@RestController
@RequestMapping("/api/integration/solo-leveling")
public class SoloLevelingSyncController {

    private static final Logger log = LoggerFactory.getLogger(SoloLevelingSyncController.class);

    @Value("${solo-leveling.webhook-secret:}")
    private String webhookSecret;

    private final JdbcTemplate jdbc;

    public SoloLevelingSyncController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/progress")
    public List<Map<String, Object>> getProgress(
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secret,
            @RequestParam String email) {

        if (webhookSecret.isBlank()) {
            log.warn("Webhook secret not configured, sync in open mode");
        } else if (!webhookSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid secret");
        }

        log.info("Solo Leveling requested sync for user email: {}", email);

        String sql = """
            SELECT
                t.id::text AS "topicId",
                t.title AS "topicTitle",
                lp.slug AS "pathSlug",
                uxp.xp_amount AS "xpEarned",
                uxp.earned_at AS "timestamp"
            FROM user_xp_events uxp
            JOIN topics t ON t.id = uxp.reference_id
            LEFT JOIN learning_paths lp ON lp.id = t.path_id
            JOIN users u ON u.id = uxp.user_id
            WHERE u.email = ? AND uxp.event_type = 'topic_completed'
            ORDER BY uxp.earned_at ASC
        """;

        return jdbc.queryForList(sql, email);
    }
}
