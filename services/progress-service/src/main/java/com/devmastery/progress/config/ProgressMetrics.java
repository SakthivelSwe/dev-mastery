package com.devmastery.progress.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProgressMetrics {

    private final Counter layersCompleted;
    private final Counter codeExecuted;
    private final Counter xpEarned;

    public ProgressMetrics(MeterRegistry registry) {
        this.layersCompleted = Counter.builder("devmastery.progress.layer.completed")
                .description("Number of learning layers completed")
                .register(registry);

        this.codeExecuted = Counter.builder("devmastery.progress.code.executed")
                .description("Number of times code was executed successfully")
                .register(registry);

        this.xpEarned = Counter.builder("devmastery.progress.xp.earned")
                .description("Total XP earned by users")
                .register(registry);
    }

    public void incrementLayersCompleted() {
        layersCompleted.increment();
    }

    public void incrementCodeExecuted() {
        codeExecuted.increment();
    }

    public void incrementXpEarned(double amount) {
        xpEarned.increment(amount);
    }
}
