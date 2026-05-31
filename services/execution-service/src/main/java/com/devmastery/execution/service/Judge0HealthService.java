package com.devmastery.execution.service;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Judge0HealthService — warms up the Judge0 CE sandbox and tracks readiness.
 *
 * Problem: Judge0 CE takes 10–30 seconds to start accepting submissions after
 * Docker starts. Without warmup, the first submissions return HTTP 500.
 *
 * Solution: @PostConstruct starts a background thread that polls Judge0 with
 * a simple Java "Hello World" every 10 seconds until success, then stops.
 *
 * All execution endpoints check isReady() before processing requests.
 * If not ready, they return HTTP 503 with a retry-after message.
 */
@Slf4j
@Service
public class Judge0HealthService {

    private static final String WARMUP_CODE =
            "public class Main { public static void main(String[] args) { System.out.println(\"OK\"); } }";

    @Value("${judge0.url:http://localhost:2358}")
    private String judge0Url;

    @Value("${judge0.warmup-interval-ms:10000}")
    private int warmupIntervalMs;

    @Value("${judge0.max-warmup-attempts:30}")
    private int maxWarmupAttempts;

    private final AtomicBoolean ready    = new AtomicBoolean(false);
    private final AtomicInteger attempts = new AtomicInteger(0);
    private final Instant startTime      = Instant.now();

    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "judge0-warmup");
                t.setDaemon(true);
                return t;
            });

    /** Represents the current warmup state for /actuator/health/judge0 */
    public record Judge0Status(boolean ready, int attempts, String message) {}

    @PostConstruct
    public void startWarmup() {
        log.info("Judge0 warmup started — polling every {}ms, max {} attempts", warmupIntervalMs, maxWarmupAttempts);
        scheduler.scheduleWithFixedDelay(this::warmupLoop, 0, warmupIntervalMs, TimeUnit.MILLISECONDS);
    }

    private void warmupLoop() {
        if (ready.get()) {
            scheduler.shutdown();
            return;
        }

        int attempt = attempts.incrementAndGet();
        if (attempt > maxWarmupAttempts) {
            log.warn("Judge0 failed to warm up after {} attempts. Will continue serving — requests will return 503.", attempt);
            scheduler.shutdown();
            return;
        }

        log.debug("Judge0 warming up... attempt {}/{}", attempt, maxWarmupAttempts);

        try {
            WebClient client = WebClient.builder()
                    .baseUrl(judge0Url)
                    .build();

            // Submit a simple Hello World to verify Judge0 can compile and run
            Map<String, Object> payload = Map.of(
                    "source_code", WARMUP_CODE,
                    "language_id", 62,
                    "stdin",       ""
            );

            Map<?, ?> response = client.post()
                    .uri("/submissions?wait=true&base64_encoded=false")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null) {
                Object statusObj = response.get("status");
                if (statusObj instanceof Map<?, ?> statusMap) {
                    Object statusId = statusMap.get("id");
                    // Status 1=Queue, 2=Processing, 3=Accepted — all indicate Judge0 is alive
                    if (statusId instanceof Number n && (n.intValue() == 1 || n.intValue() == 2 || n.intValue() == 3)) {
                        long elapsed = Duration.between(startTime, Instant.now()).toSeconds();
                        log.info("✅ Judge0 ready after {} attempt(s) ({}s since startup)", attempt, elapsed);
                        ready.set(true);
                        scheduler.shutdown();
                        return;
                    }
                }
            }

            log.debug("Judge0 not ready yet — status did not indicate acceptance (attempt {})", attempt);
        } catch (Exception e) {
            log.debug("Judge0 warmup attempt {} failed: {}", attempt, e.getMessage());
        }
    }

    /** @return true if Judge0 has successfully processed at least one warmup submission */
    public boolean isReady() {
        return ready.get();
    }

    /** @return full status for /actuator/health/judge0 */
    public Judge0Status getStatus() {
        if (ready.get()) {
            return new Judge0Status(true, attempts.get(),
                    "Judge0 is ready — code execution available");
        }
        int current = attempts.get();
        return new Judge0Status(false, current,
                String.format("Judge0 warming up — attempt %d/%d", current, maxWarmupAttempts));
    }
}
