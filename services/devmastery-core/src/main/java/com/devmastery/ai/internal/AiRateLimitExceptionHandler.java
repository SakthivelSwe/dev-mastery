package com.devmastery.ai.internal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Maps {@link RateLimitExceededException} → HTTP 429 Too Many Requests.
 *
 * <p>Scoped to the {@code com.devmastery.ai} package so it only intercepts
 * AI-related endpoints; the global 500 handler in {@code common.exception}
 * continues to handle everything else.</p>
 */
@RestControllerAdvice(basePackages = "com.devmastery.ai")
class AiRateLimitExceptionHandler {

    @ExceptionHandler(RateLimitExceededException.class)
    ResponseEntity<Map<String, Object>> tooMany(RateLimitExceededException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", 429);
        body.put("error", "Too Many Requests");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "3600")
                .body(body);
    }
}

