package com.devmastery.execution.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ExecutionMetrics {

    private final Counter codeSubmissions;
    private final Counter executionErrors;

    public ExecutionMetrics(MeterRegistry registry) {
        this.codeSubmissions = Counter.builder("devmastery.execution.code.submissions")
                .description("Number of code executions submitted to Judge0")
                .register(registry);

        this.executionErrors = Counter.builder("devmastery.execution.code.errors")
                .description("Number of code executions that resulted in error or failed")
                .register(registry);
    }

    public void incrementSubmissions() {
        codeSubmissions.increment();
    }

    public void incrementErrors() {
        executionErrors.increment();
    }
}
