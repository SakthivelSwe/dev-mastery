package com.devmastery.ai.service;

import com.devmastery.ai.dto.TopicResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class TopicServiceClient {

    private final WebClient webClient;

    public TopicServiceClient(WebClient.Builder webClientBuilder, 
                              @Value("${content-service.url}") String contentServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(contentServiceUrl).build();
    }

    @Cacheable(value = "topics", key = "#slug")
    public TopicResponse getTopicBySlug(String slug) {
        return webClient.get()
                .uri("/v1/topics/{slug}", slug)
                .retrieve()
                .bodyToMono(TopicResponse.class)
                .block();
    }
}
