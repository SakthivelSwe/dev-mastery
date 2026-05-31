package com.devmastery.auth.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthMetrics {

    private final Counter loginSuccess;
    private final Counter loginFailures;
    private final Counter newSignups;

    public AuthMetrics(MeterRegistry registry) {
        this.loginSuccess = Counter.builder("devmastery.auth.login.success")
                .description("Number of successful logins")
                .register(registry);

        this.loginFailures = Counter.builder("devmastery.auth.login.failures")
                .description("Number of failed login attempts")
                .register(registry);

        this.newSignups = Counter.builder("devmastery.auth.signups")
                .description("Number of new user registrations")
                .register(registry);
    }

    public void incrementLoginSuccess() {
        loginSuccess.increment();
    }

    public void incrementLoginFailures() {
        loginFailures.increment();
    }

    public void incrementNewSignups() {
        newSignups.increment();
    }
}
