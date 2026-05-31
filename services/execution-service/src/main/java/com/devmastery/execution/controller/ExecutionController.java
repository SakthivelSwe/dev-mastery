package com.devmastery.execution.controller;

import com.devmastery.execution.dto.CodeExecutionRequest;
import com.devmastery.execution.dto.Judge0SubmissionResponse;
import com.devmastery.execution.service.ExecutionService;
import com.devmastery.execution.service.Judge0Client;
import com.devmastery.execution.service.Judge0HealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * ExecutionController — handles both WebSocket (legacy) and REST code execution.
 *
 * REST endpoints:
 *   POST /v1/execute              → submit code, returns Judge0 token
 *   GET  /v1/execute/result/{token} → poll Judge0 for result
 *
 * All REST endpoints return HTTP 503 if Judge0 is still warming up.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
@ResponseBody
public class ExecutionController {

    private final ExecutionService   executionService;
    private final Judge0HealthService judge0Health;
    private final Judge0Client        judge0Client;

    // ─── 503 response body ────────────────────────────────────────────────────
    private static final Map<String, Object> WARMING_UP_RESPONSE = Map.of(
            "error",               "Code execution service is warming up. Please retry in a few seconds.",
            "retryAfterSeconds",   5
    );

    // ─── Legacy WebSocket handler (keep for backward compat) ──────────────────
    @MessageMapping("/execute/{sessionId}")
    public void executeCode(@DestinationVariable String sessionId, @Payload CodeExecutionRequest request) {
        log.info("WS execution request for session: {}", sessionId);
        executionService.executeCode(sessionId, request);
    }

    // ─── REST: Submit code → return token ────────────────────────────────────
    /**
     * POST /v1/execute
     * Body: { code: string, languageId: number, stdin?: string }
     * Returns: { token: string } or 503 if Judge0 not ready.
     */
    @PostMapping("/v1/execute")
    public Mono<ResponseEntity<Object>> submitCode(
            @RequestBody Map<String, Object> body
    ) {
        if (!judge0Health.isReady()) {
            log.warn("POST /v1/execute rejected — Judge0 not ready yet");
            return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body((Object) WARMING_UP_RESPONSE));
        }

        String code       = (String) body.getOrDefault("code", "");
        int    languageId = ((Number) body.getOrDefault("languageId", 62)).intValue();
        String stdin      = (String) body.getOrDefault("stdin", "");

        var submissionRequest = new com.devmastery.execution.dto.Judge0SubmissionRequest();
        submissionRequest.setSourceCode(code);
        submissionRequest.setLanguageId(languageId);
        submissionRequest.setStdin(stdin);

        return judge0Client.submitCode(submissionRequest)
                .map(token -> ResponseEntity.ok().<Object>body(Map.of("token", token)))
                .onErrorResume(e -> {
                    log.error("Judge0 submission failed: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Submission failed: " + e.getMessage())));
                });
    }

    // ─── REST: Poll result by token ───────────────────────────────────────────
    /**
     * GET /v1/execute/result/{token}
     * Returns the execution result from Judge0 or 503 if not ready.
     */
    @GetMapping("/v1/execute/result/{token}")
    public Mono<ResponseEntity<Object>> getResult(@PathVariable String token) {
        if (!judge0Health.isReady()) {
            return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body((Object) WARMING_UP_RESPONSE));
        }

        return judge0Client.getSubmission(token)
                .map(result -> ResponseEntity.ok().<Object>body(result))
                .onErrorResume(e -> {
                    log.error("Failed to get Judge0 result for token {}: {}", token, e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Failed to retrieve result: " + e.getMessage())));
                });
    }

    // ─── REST: Judge0 health status ───────────────────────────────────────────
    @GetMapping("/v1/execute/health")
    public ResponseEntity<Object> health() {
        var status = judge0Health.getStatus();
        if (status.ready()) {
            return ResponseEntity.ok(Map.of("status", "READY", "message", status.message()));
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("status", "WARMING_UP", "attempts", status.attempts(), "message", status.message()));
    }
}

