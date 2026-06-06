package com.devmastery.ai.internal;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
class AiClientConfig {
    @Bean
    WebClient.Builder webClientBuilder() { return WebClient.builder(); }
}
