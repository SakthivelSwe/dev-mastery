package com.devmastery.ai.dto;

/**
 * Non-streaming chat response for clients that don't support SSE
 * (e.g., Android mobile app).
 */
public record ChatResponse(String reply) {}

