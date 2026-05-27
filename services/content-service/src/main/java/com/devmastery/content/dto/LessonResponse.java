package com.devmastery.content.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Lesson response — one of 6 sections within a topic.
 * content_mdx is the full MDX string rendered by Next.js.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LessonResponse(
        UUID id,
        UUID topicId,
        String sectionType,      // why | theory | visual | code | realworld | interview
        String title,
        String contentMdx,
        Integer orderIndex,
        Integer estimatedMins,
        Boolean isPublished,
        OffsetDateTime createdAt
) {}
