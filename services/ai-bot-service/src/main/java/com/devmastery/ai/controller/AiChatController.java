package com.devmastery.ai.controller;

import com.devmastery.ai.dto.ChatRequest;
import com.devmastery.ai.dto.ChatResponse;
import com.devmastery.ai.dto.FeynmanRequest;
import com.devmastery.ai.dto.FeynmanScoreResponse;
import com.devmastery.ai.service.AiChatService;
import com.devmastery.ai.service.FeynmanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * AiChatController — All AI endpoints for DevMastery.
 *
 * POST /v1/ai/chat           — SSE streaming chat (topic-aware)
 * POST /v1/ai/feynman/score  — Feynman explanation scoring (1–10 JSON)
 */
@Slf4j
@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "https://devmastery.app"}, allowCredentials = "false")
public class AiChatController {

    private final AiChatService aiChatService;
    private final FeynmanService feynmanService;

    /**
     * SSE streaming endpoint — real-time token-by-token AI response.
     * The frontend connects via EventSource / ReadableStream.
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@Valid @RequestBody ChatRequest request) {
        log.debug("Chat request for topic: {}, section: {}", request.topicSlug(), request.sectionType());
        return aiChatService.streamChat(request);
    }

    /**
     * Non-streaming JSON endpoint for mobile clients (Android) that don't support SSE.
     * Collects the full AI response and returns it as a single JSON object.
     */
    @PostMapping(value = "/chat/sync", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ChatResponse> chatSync(@Valid @RequestBody ChatRequest request) {
        log.debug("Sync chat request for topic: {}, section: {}", request.topicSlug(), request.sectionType());
        return aiChatService.chatSync(request);
    }

    /**
     * Feynman scoring endpoint — synchronous, returns JSON score.
     * Sends explanation to Gemini with structured scoring prompt.
     */
    @PostMapping(value = "/feynman/score", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<FeynmanScoreResponse> scoreFeynman(@Valid @RequestBody FeynmanRequest request) {
        log.debug("Feynman score request for topic: {}", request.topicSlug());
        return feynmanService.scoreExplanation(request);
    }
}
