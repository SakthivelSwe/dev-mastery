package com.devmastery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * DevMastery — Modular Monolith Entrypoint.
 *
 * <p>Boundaries between modules are enforced by package layout:
 * each module exposes a public {@code service} interface; concrete
 * implementations and repositories are package-private. Inter-module
 * communication uses these service interfaces and Spring
 * {@code ApplicationEvent}s (no Kafka, no Feign).</p>
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
public class DevMasteryApplication {
    public static void main(String[] args) {
        SpringApplication.run(DevMasteryApplication.class, args);
    }
}
