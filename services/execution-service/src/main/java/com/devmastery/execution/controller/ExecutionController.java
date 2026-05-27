package com.devmastery.execution.controller;

import com.devmastery.execution.dto.ExecutionRequest;
import com.devmastery.execution.dto.ExecutionResponse;
import com.devmastery.execution.service.ExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/execution")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/submit")
    public ResponseEntity<ExecutionResponse> submitCode(@Valid @RequestBody ExecutionRequest request) {
        return ResponseEntity.ok(executionService.submitCode(request));
    }
}
