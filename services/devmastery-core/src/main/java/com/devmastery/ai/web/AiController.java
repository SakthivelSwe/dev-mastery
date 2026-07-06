package com.devmastery.ai.web;

import com.devmastery.ai.api.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/ai")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private final AiService ai;
    public AiController(AiService ai) { this.ai = ai; }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@AuthenticationPrincipal(errorOnInvalidType = false) UUID userId,
                             @RequestBody ChatRequest req) {
        return ai.chat(userId, req.topicSlug(), req.sectionType(),
                        req.userQuery(), req.history() == null ? List.of() : req.history())
                // Last line of defence — any error must be delivered as SSE data, never as
                // an HTTP exception (which would trip HttpMediaTypeNotAcceptableException
                // because the client's Accept header is text/event-stream).
                .onErrorResume(ex -> {
                    log.warn("AI chat stream failed: {}", ex.toString());
                    if (ex instanceof WebClientResponseException wex) {
                        int code = wex.getStatusCode().value();
                        if (code == 429) {
                            return Flux.just("The AI service is currently rate-limited. Please try again in a minute.");
                        }
                        if (code == 401 || code == 403) {
                            return Flux.just("The AI service is not authorised. Please contact an administrator.");
                        }
                        return Flux.just("The AI service returned an error (" + code + "). Please try again.");
                    }
                    return Flux.just("The AI service is temporarily unavailable. Please try again shortly.");
                });
    }

    @PostMapping("/feynman/score")
    public Mono<AiService.FeynmanScore> feynman(@AuthenticationPrincipal(errorOnInvalidType = false) UUID userId,
                                                @RequestBody FeynmanRequest req) {
        return ai.scoreFeynman(userId, req.topicSlug(), req.explanation());
    }

    public record ChatRequest(String topicSlug, String sectionType, String userQuery,
                              List<AiService.ChatTurn> history) { }

    public record FeynmanRequest(String topicSlug, String explanation) { }
}
