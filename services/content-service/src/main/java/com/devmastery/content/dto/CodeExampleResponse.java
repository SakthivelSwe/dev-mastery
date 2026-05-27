package com.devmastery.content.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Code example response — runnable snippet at a specific difficulty level.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CodeExampleResponse(
        UUID id,
        UUID topicId,
        UUID lessonId,
        String language,
        Integer level,
        String title,
        String code,
        String explanation,
        String timeComplexity,
        String spaceComplexity,
        Boolean isRunnable,
        Integer orderIndex,
        OffsetDateTime createdAt
) {}
