package com.devmastery.content.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public record AdminTopicSummaryResponse(
        UUID id,
        String slug,
        String title,
        Integer level,
        Integer orderIndex,
        Boolean hasVisualizer,
        Boolean hasCodeLab,
        Boolean isPublished,
        int wordCount,
        boolean hasContent,
        OffsetDateTime updatedAt
) {}
