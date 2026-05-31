package com.devmastery.ai.controller;

import com.devmastery.ai.dto.CodeReviewRequest;
import com.devmastery.ai.service.CodeReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/v1/ai/review")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewService codeReviewService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamCodeReview(@RequestBody CodeReviewRequest request) {
        return codeReviewService.streamCodeReview(request);
    }
}
