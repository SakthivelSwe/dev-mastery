package com.devmastery.content.controller;

import com.devmastery.content.dto.TopicResponse;
import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.service.TopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for Topics.
 *
 * GET /v1/topics              — paginated + filterable list
 * GET /v1/topics/{slug}       — full topic with all 6 lessons
 */
@RestController
@RequestMapping("/v1/topics")
@RequiredArgsConstructor
@Tag(name = "Topics", description = "Learning topics within paths — each with 6 teaching layers")
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    @Operation(summary = "List topics with filters",
               description = "Supports filtering by pathSlug, level (1-5), hasVisualizer. Paginated.")
    public ResponseEntity<Page<TopicSummaryResponse>> getTopics(
            @RequestParam(required = false)
            @Parameter(description = "Filter by path slug e.g. dsa-mastery") String pathSlug,

            @RequestParam(required = false)
            @Parameter(description = "Filter by difficulty level 1-5") Integer level,

            @RequestParam(required = false)
            @Parameter(description = "Filter for topics with DSA visualizer") Boolean hasVisualizer,

            @RequestParam(required = false)
            @Parameter(description = "Filter by specific tags") List<String> tags,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                topicService.getTopics(pathSlug, level, hasVisualizer, tags, page, size));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get full topic detail",
               description = "Returns topic with all 6 lesson sections and code examples. Cached 6h in Valkey.")
    public ResponseEntity<TopicResponse> getTopic(
            @PathVariable @Parameter(description = "Topic slug e.g. java-hashmap-internal") String slug
    ) {
        return ResponseEntity.ok(topicService.getTopic(slug));
    }
}
