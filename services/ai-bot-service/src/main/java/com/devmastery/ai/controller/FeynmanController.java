package com.devmastery.ai.controller;

import com.devmastery.ai.dto.FeynmanRequest;
import com.devmastery.ai.dto.FeynmanScoreResponse;
import com.devmastery.ai.service.FeynmanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/v1/ai/feynman")
@RequiredArgsConstructor
public class FeynmanController {

    private final FeynmanService feynmanService;

    @PostMapping("/evaluate")
    public Mono<FeynmanScoreResponse> evaluate(@RequestBody FeynmanRequest request) {
        return feynmanService.scoreExplanation(request);
    }
}
