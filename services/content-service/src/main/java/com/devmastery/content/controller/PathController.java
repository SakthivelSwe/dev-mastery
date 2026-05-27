package com.devmastery.content.controller;

import com.devmastery.content.dto.PathResponse;
import com.devmastery.content.service.PathService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Learning Paths.
 *
 * GET /v1/paths              — list all active paths
 * GET /v1/paths/{slug}       — single path with paginated topics
 */
@RestController
@RequestMapping("/v1/paths")
@RequiredArgsConstructor
@Tag(name = "Learning Paths", description = "DevMastery learning track catalog")
public class PathController {

    private final PathService pathService;

    @GetMapping
    @Operation(summary = "List all active learning paths",
               description = "Returns all 7 learning paths ordered by display order. Cached 24h in Valkey.")
    public ResponseEntity<List<PathResponse>> getAllPaths() {
        return ResponseEntity.ok(pathService.getAllPaths());
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get learning path with topics",
               description = "Returns path details with paginated topic list.")
    public ResponseEntity<PathResponse> getPath(
            @PathVariable @Parameter(description = "Path slug e.g. java-mastery") String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(pathService.getPath(slug, page, size));
    }
}
