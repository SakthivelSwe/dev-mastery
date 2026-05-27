package com.devmastery.content.controller;

import com.devmastery.content.dto.PathRoadmapResponse;
import com.devmastery.content.service.PathRoadmapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/paths")
@RequiredArgsConstructor
@Tag(name = "Learning Paths Roadmap", description = "Detailed roadmap visualization for learning paths")
public class PathRoadmapController {

    private final PathRoadmapService roadmapService;

    @GetMapping("/{slug}/roadmap")
    @Operation(summary = "Get full roadmap for a path",
               description = "Returns the entire path organized by levels, including user progress. Cached in Valkey.")
    public ResponseEntity<PathRoadmapResponse> getPathRoadmap(
            @PathVariable @Parameter(description = "Path slug e.g. java-mastery") String slug,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId
    ) {
        return ResponseEntity.ok(roadmapService.getPathRoadmap(slug, userId));
    }
}
