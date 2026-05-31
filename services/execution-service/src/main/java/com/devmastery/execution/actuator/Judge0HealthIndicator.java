package com.devmastery.execution.actuator;

import com.devmastery.execution.service.Judge0HealthService;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom Spring Boot Actuator health indicator for Judge0.
 *
 * Registers as "judge0" under /actuator/health/judge0.
 * Shown in /actuator/health when management.endpoint.health.show-details=always.
 *
 * Health states:
 *   UP   — Judge0 has processed at least one warmup submission successfully
 *   DOWN — Judge0 is still warming up or failed to warm up
 */
@Component("judge0Health")
public class Judge0HealthIndicator implements HealthIndicator {

    private final Judge0HealthService healthService;

    public Judge0HealthIndicator(Judge0HealthService healthService) {
        this.healthService = healthService;
    }

    @Override
    public Health health() {
        Judge0HealthService.Judge0Status status = healthService.getStatus();

        if (status.ready()) {
            return Health.up()
                    .withDetail("status",   "READY")
                    .withDetail("attempts", status.attempts())
                    .withDetail("message",  status.message())
                    .build();
        }

        return Health.down()
                .withDetail("status",   "WARMING_UP")
                .withDetail("attempts", status.attempts())
                .withDetail("message",  status.message())
                .withDetail("hint",     "Retry in a few seconds. Judge0 CE needs warmup after Docker start.")
                .build();
    }
}
