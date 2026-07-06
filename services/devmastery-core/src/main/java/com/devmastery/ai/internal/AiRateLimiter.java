package com.devmastery.ai.internal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Per-user, per-day AI request counter.
 *
 * <p>Guards the free Gemini quota (1M tokens/day globally) and protects
 * individual users from runaway loops or abuse. In-memory only — no Valkey
 * needed for a modular monolith. State resets when the JVM restarts, which
 * is acceptable at our current scale (1–10 users on the free tier) and
 * intentionally conservative.</p>
 *
 * <p>To extract into its own service later, swap the {@link ConcurrentHashMap}
 * for a Redis/Valkey INCR + EXPIRE.</p>
 */
@Component
public class AiRateLimiter {

    private final int dailyLimit;

    /** Key = userId + ":" + isoDate → running count. */
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public AiRateLimiter(@Value("${app.ai.rate-limit.daily-per-user:100}") int dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    /**
     * Reserve one AI request for the given user. Throws {@link RateLimitExceededException}
     * (mapped to HTTP 429 by {@code AiRateLimitExceptionHandler}) when the daily budget
     * is exhausted. Anonymous users (null userId) are allowed through — auth filter is
     * expected to reject them earlier when required.
     */
    public void tryReserve(UUID userId) {
        if (userId == null) return;
        String key = userId + ":" + LocalDate.now();
        AtomicInteger counter = counters.computeIfAbsent(key, k -> new AtomicInteger());
        int used = counter.incrementAndGet();
        if (used > dailyLimit) {
            counter.decrementAndGet();
            throw new RateLimitExceededException(
                    "Daily AI limit reached (" + dailyLimit + " requests). Resets at midnight UTC.");
        }
        // Opportunistic cleanup of yesterday's keys — cheap, avoids background thread.
        if (counters.size() > 10_000) {
            String today = LocalDate.now().toString();
            counters.keySet().removeIf(k -> !Objects.equals(k.substring(k.indexOf(':') + 1), today));
        }
    }

    /** Current usage snapshot for observability / dashboards. */
    public int currentUsage(UUID userId) {
        if (userId == null) return 0;
        AtomicInteger c = counters.get(userId + ":" + LocalDate.now());
        return c == null ? 0 : c.get();
    }

    public int dailyLimit() { return dailyLimit; }
}

