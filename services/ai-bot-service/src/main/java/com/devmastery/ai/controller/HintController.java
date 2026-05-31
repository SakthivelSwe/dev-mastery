package com.devmastery.ai.controller;

import com.devmastery.ai.dto.HintRequest;
import com.devmastery.ai.dto.HintResponse;
import com.devmastery.ai.service.HintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/ai/hint")
@RequiredArgsConstructor
public class HintController {

    private final HintService hintService;

    @PostMapping
    public ResponseEntity<HintResponse> getHint(@RequestBody HintRequest request) {
        return ResponseEntity.ok(hintService.getHint(request));
    }
}
