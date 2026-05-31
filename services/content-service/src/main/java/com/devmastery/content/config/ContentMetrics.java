package com.devmastery.content.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ContentMetrics {

    private final Counter codeExampleViews;
    private final Counter topicViews;

    public ContentMetrics(MeterRegistry registry) {
        this.codeExampleViews = Counter.builder("devmastery.content.code_example.views")
                .description("Number of times a code example was requested")
                .register(registry);

        this.topicViews = Counter.builder("devmastery.content.topic.views")
                .description("Number of times a topic was viewed")
                .register(registry);
    }

    public void incrementCodeExampleViews() {
        codeExampleViews.increment();
    }

    public void incrementTopicViews() {
        topicViews.increment();
    }
}
