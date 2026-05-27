package com.devmastery.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ChatRequest(
    @NotBlank String message,
    @NotBlank String topicSlug,
    String sectionType
) {}
