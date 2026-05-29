package com.devmastery.ai.service;

import com.devmastery.ai.dto.FeynmanRequest;
import com.devmastery.ai.dto.FeynmanScoreResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * FeynmanService — Evaluates a student's plain-language explanation of a concept.
 *
 * The Feynman Technique is one of the most powerful learning methods:
 * if you can explain something simply, you truly understand it.
 *
 * This service sends the explanation to Gemini with a carefully crafted
 * scoring prompt and parses back a structured JSON score (1–10) with feedback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FeynmanService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    // ─── Feynman Scoring Prompt ───────────────────────────────
    // This prompt instructs Gemini to act as a Socratic examiner.
    // It MUST return valid JSON — we enforce this via response schema.

    private static final String FEYNMAN_SYSTEM_PROMPT = """
        You are a strict but fair Socratic mentor evaluating a software engineering student's
        conceptual understanding using the Feynman Technique.

        Your task:
        1. Read the student's explanation of the given programming concept.
        2. Score their understanding from 1 to 10 (integer only).
        3. Provide one concise paragraph of constructive feedback (max 120 words).
        4. Identify up to 3 specific knowledge gaps or inaccuracies in their explanation.

        Scoring rubric:
        1-3  = Major misconceptions or mostly incorrect
        4-5  = Basic understanding but significant gaps
        6    = Adequate understanding, notable gaps
        7-8  = Good understanding, minor gaps (PASSED)
        9-10 = Expert-level, clear and complete (PASSED)

        A student PASSES (score >= 7) when their explanation is clear, accurate, and could
        genuinely help a junior developer understand the concept.

        You MUST respond with ONLY valid JSON in this exact format, no markdown, no commentary:
        {
          "score": <integer 1-10>,
          "feedback": "<constructive paragraph>",
          "gaps": ["<gap1>", "<gap2>", "<gap3>"],
          "passed": <true if score >= 7, false otherwise>
        }
        """;

    public Mono<FeynmanScoreResponse> scoreExplanation(FeynmanRequest request) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

        String userPrompt = """
            Topic: %s

            Student's explanation:
            ---
            %s
            ---

            Evaluate this explanation and return your assessment as JSON.
            """.formatted(request.topicTitle(), request.explanation());

        Map<String, Object> body = new HashMap<>();
        body.put("systemInstruction", Map.of(
            "parts", List.of(Map.of("text", FEYNMAN_SYSTEM_PROMPT))
        ));
        body.put("contents", List.of(
            Map.of("parts", List.of(Map.of("text", userPrompt)))
        ));
        // Force JSON output mode
        body.put("generationConfig", Map.of(
            "responseMimeType", "application/json",
            "temperature", 0.3,
            "maxOutputTokens", 512
        ));

        return webClientBuilder.build()
                .post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseFeynmanResponse)
                .onErrorReturn(fallbackScore(request.topicTitle()));
    }

    private FeynmanScoreResponse parseFeynmanResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String text = root
                .path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();

            // Strip potential markdown code fences
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            JsonNode result = objectMapper.readTree(text);
            int score = result.path("score").asInt(5);
            String feedback = result.path("feedback").asText("Good effort! Keep practicing.");
            boolean passed = result.path("passed").asBoolean(score >= 7);

            List<String> gaps = new ArrayList<>();
            JsonNode gapsNode = result.path("gaps");
            if (gapsNode.isArray()) {
                gapsNode.forEach(g -> gaps.add(g.asText()));
            }

            return new FeynmanScoreResponse(score, feedback, gaps, passed);
        } catch (Exception e) {
            log.error("Failed to parse Feynman response: {}", e.getMessage());
            return fallbackScore("this topic");
        }
    }

    private FeynmanScoreResponse fallbackScore(String topicTitle) {
        return new FeynmanScoreResponse(
            5,
            "Your explanation shows some understanding of " + topicTitle + ". " +
            "Try to be more specific about the core mechanisms and use concrete examples. " +
            "Review the theory layer and attempt again.",
            List.of(
                "Could not fully parse your explanation — please try again.",
                "Ensure you cover the core concept, not just surface details."
            ),
            false
        );
    }
}
