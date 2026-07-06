package com.devmastery.ai.internal;

import com.devmastery.ai.api.AiService;
import com.devmastery.content.api.ContentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Direct Gemini integration via {@link WebClient}.
 * Primary model comes from {@code app.ai.gemini.model} (env {@code GEMINI_MODEL}).
 * Automatically falls back to {@code app.ai.gemini.fallback-model} on 429/5xx —
 * this protects users when the Pro tier free quota is exhausted.
 *
 * <p>Other modules MUST NOT call Gemini directly — they call this
 * service via the {@link AiService} interface.</p>
 */
@Service
class GeminiAiService implements AiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final WebClient client;
    private final ObjectMapper json = new ObjectMapper();
    private final String apiKey;
    private final String model;
    private final String fallbackModel;
    private final ContentService content;

    GeminiAiService(WebClient.Builder builder,
                    @Value("${app.ai.gemini.api-key}") String apiKey,
                    @Value("${app.ai.gemini.model:gemini-2.5-flash}") String model,
                    @Value("${app.ai.gemini.fallback-model:gemini-2.5-flash}") String fallbackModel,
                    ContentService content) {
        this.client = builder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.apiKey = apiKey;
        this.model = model;
        // Only use fallback if it's different from primary; otherwise nothing to fall back to.
        this.fallbackModel = model.equalsIgnoreCase(fallbackModel) ? null : fallbackModel;
        this.content = content;
    }

    @Override
    public Flux<String> chat(UUID userId, String topicSlug, String sectionType,
                             String userQuery, List<ChatTurn> history) {
        String system = buildSystemPrompt(topicSlug, sectionType);
        Map<String, Object> body = buildRequest(system, history, userQuery);

        return streamChat(model, body)
                .onErrorResume(WebClientResponseException.class, ex -> {
                    if (shouldFallback(ex) && fallbackModel != null) {
                        log.warn("Gemini model '{}' returned {} — falling back to '{}'",
                                model, ex.getStatusCode().value(), fallbackModel);
                        return streamChat(fallbackModel, body)
                                .onErrorResume(WebClientResponseException.class,
                                        e2 -> Flux.just(friendlyMessage(e2)));
                    }
                    return Flux.just(friendlyMessage(ex));
                });
    }

    private Flux<String> streamChat(String modelName, Map<String, Object> body) {
        return client.post()
                .uri(uriBuilder -> uriBuilder.path("/v1beta/models/{model}:streamGenerateContent")
                        .queryParam("alt", "sse")
                        .queryParam("key", apiKey)
                        .build(modelName))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .mapNotNull(this::extractText);
    }

    @Override
    public Mono<FeynmanScore> scoreFeynman(UUID userId, String topicSlug, String explanation) {
        String prompt = """
            You are an expert tutor evaluating a Feynman-style explanation of topic "%s".
            Score it on a 1-10 scale and return STRICT JSON:
            {"score":N,"feedback":"...","strengths":["..."],"gaps":["..."]}
            Explanation:
            %s
            """.formatted(topicSlug, explanation);

        Map<String, Object> body = buildRequest("You are a strict JSON-only grader.", List.of(), prompt);

        return callFeynman(model, body)
                .onErrorResume(WebClientResponseException.class, ex -> {
                    if (shouldFallback(ex) && fallbackModel != null) {
                        log.warn("Gemini model '{}' returned {} on feynman — falling back to '{}'",
                                model, ex.getStatusCode().value(), fallbackModel);
                        return callFeynman(fallbackModel, body)
                                .onErrorResume(WebClientResponseException.class,
                                        e2 -> Mono.just(new FeynmanScore(5, friendlyMessage(e2), List.of(), List.of())));
                    }
                    return Mono.just(new FeynmanScore(5, friendlyMessage(ex), List.of(), List.of()));
                });
    }

    private Mono<FeynmanScore> callFeynman(String modelName, Map<String, Object> body) {
        return client.post()
                .uri(uriBuilder -> uriBuilder.path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", apiKey).build(modelName))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(this::parseFeynman);
    }

    // ─── helpers ───────────────────────────────────────────

    private static boolean shouldFallback(WebClientResponseException ex) {
        int code = ex.getStatusCode().value();
        return code == 429 || code >= 500;
    }

    private static String friendlyMessage(WebClientResponseException ex) {
        int code = ex.getStatusCode().value();
        if (code == 429) {
            return "The AI service is temporarily rate-limited (Gemini free-tier quota reached). " +
                    "Please try again in a minute, or ask an administrator to upgrade the Gemini plan.";
        }
        if (code == 401 || code == 403) {
            return "The AI service rejected the request. The Gemini API key may be invalid or expired.";
        }
        if (code >= 500) {
            return "The AI service is currently unavailable (Gemini returned " + code + "). Please try again shortly.";
        }
        return "The AI service returned an error (" + code + "). Please try again.";
    }

    private String buildSystemPrompt(String topicSlug, String sectionType) {
        String summary = "";
        try {
            var topic = content.getTopicBySlug(topicSlug);
            summary = "Topic: " + topic.title() + ". Section: " + sectionType + ".";
        } catch (Exception ignored) { /* topic optional */ }
        return "You are the DevMastery AI Mentor. " + summary
                + " Answer clearly, with examples. Cite trade-offs when relevant.";
    }

    private Map<String, Object> buildRequest(String system, List<ChatTurn> history, String userQuery) {
        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatTurn t : history) {
            contents.add(Map.of(
                    "role", t.role(),
                    "parts", List.of(Map.of("text", t.content()))));
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userQuery))));
        return Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", system))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 1024));
    }

    private String extractText(String sseChunk) {
        try {
            JsonNode root = json.readTree(sseChunk);
            JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) return parts.path(0).path("text").asText("");
        } catch (Exception ignored) { /* skip malformed chunk */ }
        return null;
    }

    private FeynmanScore parseFeynman(JsonNode root) {
        try {
            String text = root.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text").asText("{}");
            // Gemini may wrap JSON in ```json fences; strip them
            String cleaned = text.replaceAll("(?s)```(?:json)?", "").trim();
            JsonNode j = json.readTree(cleaned);
            List<String> strengths = new ArrayList<>();
            j.path("strengths").forEach(n -> strengths.add(n.asText()));
            List<String> gaps = new ArrayList<>();
            j.path("gaps").forEach(n -> gaps.add(n.asText()));
            return new FeynmanScore(
                    j.path("score").asInt(5),
                    j.path("feedback").asText(""),
                    strengths, gaps);
        } catch (Exception e) {
            return new FeynmanScore(5, "Could not parse response.", List.of(), List.of());
        }
    }
}
