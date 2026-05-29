package com.devmastery.ai.dto;

/**
 * Feynman scoring response.
 * score:    1-10 (10 = perfect mastery-level explanation)
 * feedback: Constructive paragraph from the AI
 * gaps:     List of knowledge gaps the AI identified (max 3)
 * passed:   true if score >= 7 (topic considered understood)
 */
public record FeynmanScoreResponse(
    int     score,
    String  feedback,
    java.util.List<String> gaps,
    boolean passed
) {}
