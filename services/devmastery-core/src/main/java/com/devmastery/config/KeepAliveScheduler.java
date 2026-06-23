package com.devmastery.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * KeepAliveScheduler
 *
 * Render free-tier instances spin down after 15 minutes of inactivity.
 * This scheduler fires a lightweight DB ping every 14 minutes (840 000 ms)
 * to keep the service warm. No env variables needed — the fixed interval
 * is intentionally hard-coded so it is always slightly under Render's
 * 15-minute idle threshold.
 */
@Component
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);

    private final JdbcTemplate jdbc;

    public KeepAliveScheduler(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Runs 5 minutes after startup (initialDelay) then every 14 minutes.
     * Uses {@code SELECT 1} — the cheapest possible DB round-trip.
     * The DB round-trip also prevents the Supabase connection-pool from
     * timing out idle connections.
     */
    @Scheduled(initialDelay = 300_000, fixedDelay = 840_000)
    public void ping() {
        try {
            Integer result = jdbc.queryForObject("SELECT 1", Integer.class);
            log.debug("keep-alive ping OK (db={}))", result);
        } catch (Exception ex) {
            log.warn("keep-alive ping failed: {}", ex.getMessage());
        }
    }
}

