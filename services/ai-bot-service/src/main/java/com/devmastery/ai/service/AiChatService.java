package com.devmastery.ai.service;

import com.devmastery.ai.dto.ChatRequest;
import com.devmastery.ai.dto.TopicResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final WebClient.Builder webClientBuilder;
    private final TopicServiceClient topicServiceClient;

    @Value("${gemini.api-key}")
    private String apiKey;

    public Flux<String> streamChat(ChatRequest request) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=" + apiKey;

        String systemPrompt = "You are the DevMastery AI teaching assistant.";
        
        try {
            TopicResponse topic = topicServiceClient.getTopicBySlug(request.topicSlug());
            if (topic != null) {
                systemPrompt += " The user is currently reading the topic '" + topic.title() + "'.";
                if (request.sectionType() != null && !request.sectionType().isEmpty()) {
                    systemPrompt += " They are focusing on the '" + request.sectionType() + "' section.";
                }
                systemPrompt += "\n\nHere is the content of the topic for context:\n" + topic.contentMdx() +
                        "\n\nAnswer their questions concisely based on this context. Do not make up answers outside the context if it's unrelated to programming.";
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch topic context: " + e.getMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("systemInstruction", Map.of(
            "parts", List.of(Map.of("text", systemPrompt))
        ));
        body.put("contents", List.of(
            Map.of(
                "parts", List.of(
                    Map.of("text", request.message())
                )
            )
        ));

        return webClientBuilder.build()
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractTextFromGeminiChunk)
                .onErrorResume(e -> Flux.just("data: Error connecting to AI: " + e.getMessage() + "\n\n"));
    }

    private String extractTextFromGeminiChunk(String chunk) {
        try {
            String json = chunk.startsWith("data: ") ? chunk.substring(6) : chunk;
            if (json.trim().isEmpty() || json.contains("[DONE]")) return "";
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            if (root.has("candidates") && root.get("candidates").isArray() && root.get("candidates").size() > 0) {
                com.fasterxml.jackson.databind.JsonNode parts = root.get("candidates").get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    if (text == null || text.isEmpty()) return "";
                    // SSE format requires data: payload \n\n
                    return "data: " + text.replace("\n", "\\n") + "\n\n";
                }
            }
        } catch (Exception e) {
            // Ignore parse errors on partial chunks
        }
        return "";
    }
}
