package com.devmastery.progress.dto;

import java.util.UUID;

public record LayerCompletionRequest(
        UUID topicId,
        String layerName // e.g. "feynman", "build", "spacedreview"
) {}
