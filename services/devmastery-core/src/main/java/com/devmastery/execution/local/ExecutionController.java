package com.devmastery.execution.local;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST entrypoint for in-process code execution.
 * The Next.js Edge route calls {@code POST /v1/execute} whenever
 * {@code PISTON_URL} is not configured on the frontend.
 */
@RestController
@RequestMapping("/v1/execute")
public class ExecutionController {

    private final LocalExecutor executor;

    public ExecutionController(LocalExecutor executor) { this.executor = executor; }

    /** Simple ping so the Next.js route can decide to use this fallback. */
    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("render-local", java.util.List.of("java")));
    }

    @PostMapping
    public ResponseEntity<ExecutionResult> execute(@RequestBody ExecuteRequest req) {
        String source   = req.sourceCode() != null ? req.sourceCode() : req.source();
        String language = req.language();
        String stdin    = req.stdin();
        ExecutionResult r = executor.execute(language, source, stdin);
        return ResponseEntity.ok(r);
    }

    /** Accept either {@code sourceCode} (legacy) or {@code source} (new). */
    public record ExecuteRequest(String sourceCode, String source, String language, String stdin) {}

    public record HealthResponse(String runtime, java.util.List<String> languages) {}
}

