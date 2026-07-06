package com.devmastery.execution.local;

/** Result of an in-process code execution. Mirrors the Next.js edge route's shape. */
public record ExecutionResult(
        String stdout,
        String stderr,
        String compileOutput,
        String message,
        int    statusId,          // 3 = accepted, 4 = runtime, 5 = TLE, 6 = compile error, 0 = unavailable
        String statusDescription,
        Double time,              // wall-clock seconds
        Long   memory,            // KB (approximate, from OS if available)
        String runtime            // "render-local" | "unavailable"
) {}

