package com.devmastery.content.dto;

import com.devmastery.content.entity.CodeExample;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;

/**
 * Code example response DTO for the tier-aware Code Lab API.
 *
 * Supports two shapes:
 *  - Legacy (backward compat): id, topicId, lessonId, level, isRunnable, orderIndex
 *  - New slug-based: topicSlug, tier, language, tricks, patternName
 *
 * The {@code fromEntity} factory handles both shapes.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CodeExampleResponse(
        String id,
        // Slug-based fields (new Code Lab API)
        String topicSlug,
        String tier,
        String language,
        String title,
        String code,
        String explanation,
        String timeComplexity,
        String spaceComplexity,
        List<String> tricks,
        String patternName
) {
    private static final Logger log = LoggerFactory.getLogger(CodeExampleResponse.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * Factory method — builds a CodeExampleResponse from a CodeExample entity.
     * Parses the tricksJson JSONB column into a List<String>.
     */
    public static CodeExampleResponse fromEntity(CodeExample entity) {
        List<String> tricks = parseTricks(entity.getTricksJson());

        return new CodeExampleResponse(
                entity.getId() != null ? entity.getId().toString() : null,
                entity.getTopicSlug(),
                entity.getDifficultyTier(),
                entity.getLanguage(),
                entity.getTitle(),
                entity.getCode(),
                entity.getExplanation(),
                entity.getTimeComplexity(),
                entity.getSpaceComplexity(),
                tricks,
                entity.getPatternName()
        );
    }

    /**
     * Parses the raw JSONB string into a List<String>.
     * Handles two formats:
     *  - JSON array of strings: ["trick1", "trick2"]
     *  - Fallback: returns empty list on any parse error.
     */
    private static List<String> parseTricks(String tricksJson) {
        if (tricksJson == null || tricksJson.isBlank()) return Collections.emptyList();
        try {
            return MAPPER.readValue(tricksJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse tricks_json: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
