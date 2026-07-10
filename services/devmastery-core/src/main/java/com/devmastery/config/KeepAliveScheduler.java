package com.devmastery.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * KeepAliveScheduler
 *
 * <p>Render free-tier web services spin down after 15 minutes with no
 * <b>inbound HTTP traffic</b>. A plain internal DB query is NOT enough to
 * keep them awake — Render only resets its idle timer when a real HTTP
 * request hits the public URL.</p>
 *
 * <p>This scheduler therefore fires an HTTP GET to the service's own public
 * URL ({@code /api/warmup}) every 14 minutes. That single request:</p>
 * <ol>
 *   <li>Resets Render's 15-minute idle timer (keeps the web service warm).</li>
 *   <li>Triggers the warmup endpoint's {@code SELECT 1}, keeping the
 *       Supabase database from pausing.</li>
 * </ol>
 *
 * <p>No external uptime service (UptimeRobot / cron-job.org) is required.
 * The public URL is read from {@code RENDER_EXTERNAL_URL}, which Render
 * injects automatically. When it is absent (local dev), the scheduler
 * falls back to a direct in-process DB ping.</p>
 */
@Component
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);

    private final JdbcTemplate jdbc;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /** Public base URL of this service. Render injects RENDER_EXTERNAL_URL automatically. */
    @Value("${RENDER_EXTERNAL_URL:}")
    private String selfUrl;

    public KeepAliveScheduler(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Runs 5 minutes after startup (initialDelay) then every 14 minutes.
     * 840 000 ms is intentionally just under Render's 15-minute idle threshold.
     */
    @Scheduled(initialDelay = 300_000, fixedDelay = 840_000)
    public void ping() {
        if (selfUrl != null && !selfUrl.isBlank()) {
            httpSelfPing();
        } else {
            dbPing();
        }
    }

    /** Hits the public /api/warmup endpoint so Render sees real inbound traffic. */
    private void httpSelfPing() {
        String url = selfUrl.replaceAll("/+$", "") + "/api/warmup";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "devmastery-keepalive")
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.debug("keep-alive self-ping {} -> {}", url, response.statusCode());
        } catch (Exception ex) {
            log.warn("keep-alive self-ping failed ({}): {}", url, ex.getMessage());
            // Fall back to a DB ping so Supabase still stays active.
            dbPing();
        }
    }

    /** Lightweight in-process DB round-trip (local dev / HTTP fallback). */
    private void dbPing() {
        try {
            Integer result = jdbc.queryForObject("SELECT 1", Integer.class);
            log.debug("keep-alive db ping OK (db={})", result);
        } catch (Exception ex) {
            log.warn("keep-alive db ping failed: {}", ex.getMessage());
        }
    }
}
