package com.devmastery.content.controller;

import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.service.TopicSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global OpenSearch endpoints for learning content")
public class TopicSearchController {

    private final TopicSearchService searchService;

    @GetMapping("/topics")
    @Operation(summary = "Search topics globally",
               description = "Queries OpenSearch index for topics across all paths. Fallbacks to DB if OpenSearch is down.")
    public ResponseEntity<Page<TopicSummaryResponse>> searchTopics(
            @RequestParam @Parameter(description = "Search query e.g. 'hashmap' or 'binary tree'") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(searchService.searchTopics(q, page, size));
    }
}
