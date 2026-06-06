package com.devmastery.ai.web;

import com.devmastery.ai.api.AiService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/ai")
public class AiController {

    private final AiService ai;
    public AiController(AiService ai) { this.ai = ai; }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@AuthenticationPrincipal UUID userId,
                             @RequestBody ChatRequest req) {
        return ai.chat(userId, req.topicSlug(), req.sectionType(),
                req.userQuery(), req.history() == null ? List.of() : req.history());
    }

    @PostMapping("/feynman/score")
    public Mono<AiService.FeynmanScore> feynman(@AuthenticationPrincipal UUID userId,
                                                @RequestBody FeynmanRequest req) {
        return ai.scoreFeynman(userId, req.topicSlug(), req.explanation());
    }

    public record ChatRequest(String topicSlug, String sectionType, String userQuery,
                              List<AiService.ChatTurn> history) { }

    public record FeynmanRequest(String topicSlug, String explanation) { }
}
