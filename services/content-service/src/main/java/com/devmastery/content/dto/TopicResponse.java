package com.devmastery.content.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Full topic detail response including all lessons and code examples.
 * Used for GET /v1/topics/{slug}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TopicResponse(
        UUID id,
        String slug,
        String title,
        String description,
        String pathSlug,
        String pathTitle,
        Integer level,
        Integer estimatedMins,
        Integer xpReward,
        Integer orderIndex,
        Boolean hasVisualizer,
        Boolean hasCodeLab,
        Boolean isPublished,
        String[] tags,
        String thumbnailUrl,
        OffsetDateTime createdAt,
        List<LessonResponse> lessons,
        List<CodeExampleResponse> codeExamples
) {}
