package com.devmastery.ai.api;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface AiService {

    /** Streams tokens token-by-token (SSE). */
    Flux<String> chat(UUID userId, String topicSlug, String sectionType,
                      String userQuery, List<ChatTurn> history);

    /** Scores a Feynman-style explanation (1-10) with feedback. */
    Mono<FeynmanScore> scoreFeynman(UUID userId, String topicSlug, String explanation);

    record ChatTurn(String role, String content) { } // role: "user" | "model"

    record FeynmanScore(int score, String feedback, List<String> strengths, List<String> gaps) { }
}
