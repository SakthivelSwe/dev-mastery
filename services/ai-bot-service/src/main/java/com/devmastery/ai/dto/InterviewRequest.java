package com.devmastery.ai.dto;

import java.util.UUID;

public record InterviewRequest(
    UUID sessionId,
    String message
) {}
