package com.devmastery.ai.internal;

/**
 * Thrown when a user exceeds their AI quota. Mapped to HTTP 429 by
 * {@code AiRateLimitExceptionHandler}.
 */
public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException(String message) { super(message); }
}

