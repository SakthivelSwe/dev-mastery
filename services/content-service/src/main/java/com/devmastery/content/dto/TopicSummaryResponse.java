package com.devmastery.content.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Compact topic summary used in path detail and topic list responses.
 * Does NOT include full lesson content — use TopicResponse for that.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public record TopicSummaryResponse(
        UUID id,
        String slug,
        String title,
        String description,
        Integer level,
        Integer estimatedMins,
        Integer orderIndex,
        Boolean hasVisualizer,
        Boolean hasCodeLab,
        Boolean isPublished,
        String[] tags,
        String thumbnailUrl,
        OffsetDateTime createdAt
) {}
