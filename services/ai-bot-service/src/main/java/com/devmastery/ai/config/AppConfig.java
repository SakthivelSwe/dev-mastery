package com.devmastery.ai.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * AppConfig — Core Spring beans for the AI Bot Service.
 *
 * Key decisions:
 * - WebClient with 10MB buffer (Gemini SSE streams can be large)
 * - ObjectMapper shared across services for consistent JSON handling
 * - No Redis required in dev — Valkey is optional, cache gracefully degrades
 */
@Configuration
public class AppConfig {

    /**
     * WebClient.Builder configured with a generous buffer size.
     * Gemini streaming responses can exceed the default 256KB limit.
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs(config -> config
                .defaultCodecs()
                .maxInMemorySize(10 * 1024 * 1024) // 10MB
            )
            .build();

        return WebClient.builder().exchangeStrategies(strategies);
    }

    /**
     * Shared ObjectMapper — thread-safe, reuse instead of creating per-call.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}
