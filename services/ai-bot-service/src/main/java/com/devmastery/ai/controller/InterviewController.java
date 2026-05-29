package com.devmastery.ai.controller;

import com.devmastery.ai.dto.InterviewRequest;
import com.devmastery.ai.entity.InterviewSession;
import com.devmastery.ai.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/v1/ai/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/start")
    public Mono<InterviewSession> startSession(
            @RequestHeader(value = "X-User-Id", defaultValue = "00000000-0000-0000-0000-000000000001") UUID userId,
            @RequestParam String topicSlug) {
        return interviewService.startSession(userId, topicSlug);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamInterviewResponse(@RequestBody InterviewRequest request) {
        return interviewService.streamInterviewResponse(request);
    }

    @PostMapping("/{sessionId}/complete")
    public Mono<InterviewSession> completeSession(
            @PathVariable UUID sessionId,
            @RequestBody String transcript) {
        return interviewService.completeSession(sessionId, transcript);
    }
}
