package com.devmastery.progress.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MarkCompleteRequest(
    @NotNull UUID lessonId,
    @NotNull UUID topicId,
    Integer timeSpentSecs
) {}
