package com.devmastery.ai.service;

import com.devmastery.ai.dto.InterviewRequest;
import com.devmastery.ai.dto.TopicResponse;
import com.devmastery.ai.entity.InterviewSession;
import com.devmastery.ai.repository.InterviewSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final WebClient.Builder webClientBuilder;
    private final TopicServiceClient topicServiceClient;
    private final InterviewSessionRepository repository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    private static final String INTERVIEW_SYSTEM_PROMPT = """
        You are an expert technical interviewer for a top-tier FAANG company.
        You are conducting a live, verbal-style mock interview.
        
        Rules:
        - Start by welcoming the candidate and immediately asking the first question related to the topic.
        - Act like a real interviewer: be encouraging but probe deeply.
        - DO NOT answer your own questions. Ask a question and wait for the candidate's response.
        - If the candidate is stuck, provide a small hint, not the full answer.
        - If their answer is wrong, guide them to correct it.
        - When the candidate answers correctly, acknowledge it and ask a follow-up or move to the next phase (e.g., from brute force to optimized approach).
        - Keep your responses conversational and concise (1-3 sentences ideally), since this will be read aloud via Text-to-Speech.
        - Do not use markdown code blocks or complex formatting that text-to-speech cannot read well.
        """;

    public Mono<InterviewSession> startSession(UUID userId, String topicSlug) {
        return Mono.defer(() -> {
            InterviewSession session = InterviewSession.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .topicSlug(topicSlug)
                .startedAt(LocalDateTime.now())
                .transcript("[]")
                .build();
            return repository.save(session);
        });
    }

    public Mono<InterviewSession> completeSession(UUID sessionId, String finalTranscript) {
        return repository.findById(sessionId)
            .flatMap(session -> {
                session.setCompletedAt(LocalDateTime.now());
                session.setTranscript(finalTranscript);
                // Evaluate score based on transcript in a real scenario (or using another Gemini call).
                // Hardcoding mock score for now.
                session.setScore(85);
                session.setFeedback("Great job on identifying the edge cases. Brush up on space complexity optimization.");
                return repository.save(session);
            });
    }

    public Flux<String> streamInterviewResponse(InterviewRequest request) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=" + apiKey;

        return repository.findById(request.sessionId())
            .flatMapMany(session -> {
                StringBuilder systemPrompt = new StringBuilder(INTERVIEW_SYSTEM_PROMPT);
                try {
                    TopicResponse topic = topicServiceClient.getTopicBySlug(session.getTopicSlug());
                    if (topic != null) {
                        systemPrompt.append("\n\nTopic for this interview: ").append(topic.title());
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch topic {}", session.getTopicSlug());
                }

                Map<String, Object> body = Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt.toString()))),
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", request.message())))),
                    "generationConfig", Map.of(
                        "temperature", 0.6,
                        "maxOutputTokens", 500,
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
                            log.error("Gemini stream error: {}", e.getMessage());
                            return Flux.just("data: I'm having connection issues, let's pause here.\n\n");
                        });
            });
    }

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

            return "data: " + text.replace("\n", "\\n") + "\n\n";
        } catch (Exception e) {
            return null;
        }
    }
}
