package com.devmastery.ai.service;

import com.devmastery.ai.dto.ChatRequest;
import com.devmastery.ai.dto.TopicResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * AiChatService — Powers the real-time AI assistant sidebar.
 *
 * Uses Gemini 2.0 Flash SSE streaming to deliver token-by-token responses.
 * Each response is scoped to the current topic context fetched from content-service,
 * keeping answers precise and educationally grounded.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatService {

    private final WebClient.Builder webClientBuilder;
    private final TopicServiceClient topicServiceClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    private static final String BASE_SYSTEM_PROMPT = """
        You are the DevMastery AI Teaching Assistant — an expert software engineering mentor
        specializing in Java, Spring Boot, DSA, System Design, and modern web development.

        Your teaching philosophy:
        - Use the Socratic method: ask clarifying questions when needed
        - Explain concepts with concrete code examples
        - Connect abstract ideas to real-world production scenarios
        - Be concise but complete — no filler, no repetition
        - Use markdown for code blocks: ```java, ```javascript, etc.
        - Keep responses under 300 words unless a longer explanation is essential

        If the user asks something outside software engineering, politely redirect them.
        """;

    public Flux<String> streamChat(ChatRequest request) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=" + apiKey;

        // Build a topic-aware system prompt
        StringBuilder systemPrompt = new StringBuilder(BASE_SYSTEM_PROMPT);
        try {
            TopicResponse topic = topicServiceClient.getTopicBySlug(request.topicSlug());
            if (topic != null) {
                systemPrompt.append("\n\n## Current Topic Context\n");
                systemPrompt.append("Topic: ").append(topic.title()).append("\n");
                if (request.sectionType() != null && !request.sectionType().isBlank()) {
                    systemPrompt.append("Student is on section: ").append(request.sectionType()).append("\n");
                }
                if (topic.contentMdx() != null && !topic.contentMdx().isBlank()) {
                    // Trim context to avoid exceeding token limits
                    String context = topic.contentMdx().length() > 3000
                        ? topic.contentMdx().substring(0, 3000) + "\n...[truncated]"
                        : topic.contentMdx();
                    systemPrompt.append("\nTopic content for reference:\n").append(context);
                }
                systemPrompt.append("\n\nPrioritize answering from this context. Be specific to this topic.");
            }
        } catch (Exception e) {
            log.warn("Could not fetch topic context for slug '{}': {}", request.topicSlug(), e.getMessage());
        }

        Map<String, Object> body = Map.of(
            "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt.toString()))),
            "contents", List.of(Map.of("parts", List.of(Map.of("text", request.message())))),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1024,
                "candidateCount", 1
            )
        );

        return webClientBuilder.build()
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(this::extractTextChunk)
                .filter(s -> !s.isBlank())
                .onErrorResume(e -> {
                    log.error("Gemini streaming error: {}", e.getMessage());
                    return Flux.just("data: I'm having trouble connecting right now. Please try again.\n\n");
                });
    }

    /**
     * Extracts the text token from a Gemini SSE chunk.
     * Gemini SSE format: "data: { candidates: [{ content: { parts: [{ text: "..." }] } }] }"
     */
    private String extractTextChunk(String chunk) {
        try {
            String json = chunk.startsWith("data: ") ? chunk.substring(6).trim() : chunk.trim();
            if (json.isEmpty() || json.equals("[DONE]")) return null;

            JsonNode root = objectMapper.readTree(json);
            String text = root
                .path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text").asText("");

            if (text.isEmpty()) return null;

            // SSE format: newlines in text escaped so client can reconstruct them
            return "data: " + text.replace("\n", "\\n") + "\n\n";
        } catch (Exception e) {
            return null; // Silently drop malformed chunks
        }
    }
}
