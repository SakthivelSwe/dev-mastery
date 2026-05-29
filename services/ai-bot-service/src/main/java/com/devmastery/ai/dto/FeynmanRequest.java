package com.devmastery.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for the Feynman scoring endpoint.
 * The student writes their explanation of a topic in plain language,
 * and Gemini scores their conceptual understanding from 1–10.
 */
public record FeynmanRequest(
    @NotBlank String topicSlug,
    @NotBlank String topicTitle,
    @NotBlank @Size(min = 20, max = 5000, message = "Explanation must be between 20 and 5000 characters")
    String explanation
) {}
