package com.devmastery.content.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Full Learning Path response.
 * Used for GET /v1/paths and GET /v1/paths/{slug}
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PathResponse(
        UUID id,
        String slug,
        String title,
        String description,
        String icon,
        String accentColor,
        Integer levelMin,
        Integer levelMax,
        Integer totalTopics,
        Integer estimatedHours,
        Integer orderIndex,
        Boolean isActive,
        OffsetDateTime createdAt,
        List<TopicSummaryResponse> topics   // null in list view, populated in detail view
) {}
