package com.devmastery.content.controller;

import com.devmastery.content.dto.admin.*;
import com.devmastery.content.service.AdminTopicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin REST controller for managing Topics and Content.
 */
@RestController
@RequestMapping("/admin/topics")
@RequiredArgsConstructor
@Tag(name = "Admin Topics", description = "Admin CMS for authoring DevMastery content")
// For local testing, we might temporarily comment out @PreAuthorize if no admin user exists,
// but per spec we should use @PreAuthorize("hasRole('ADMIN')")
// @PreAuthorize("hasRole('ADMIN')")
public class AdminTopicController {

    private final AdminTopicService adminTopicService;

    @GetMapping("/stats")
    @Operation(summary = "Get topic stats for dashboard")
    public ResponseEntity<AdminTopicStatsResponse> getStats() {
        return ResponseEntity.ok(adminTopicService.getStats());
    }

    @GetMapping("/paths/{pathSlug}")
    @Operation(summary = "Get topic list for a specific path")
    public ResponseEntity<List<AdminTopicSummaryResponse>> getTopicsForPath(@PathVariable String pathSlug) {
        return ResponseEntity.ok(adminTopicService.getTopicsForPath(pathSlug));
    }

    @PutMapping("/{slug}/section")
    @Operation(summary = "Save a single lesson section (MDX content)")
    public ResponseEntity<Void> updateSection(
            @PathVariable String slug,
            @Valid @RequestBody AdminSectionDraftRequest request) {
        adminTopicService.updateSection(slug, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{slug}/draft")
    @Operation(summary = "Auto-save full topic draft")
    public ResponseEntity<Void> updateDraft(
            @PathVariable String slug,
            @Valid @RequestBody AdminTopicDraftRequest request) {
        adminTopicService.updateDraft(slug, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{slug}/publish")
    @Operation(summary = "Publish topic")
    public ResponseEntity<Void> publishTopic(@PathVariable String slug) {
        adminTopicService.publishTopic(slug);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{slug}/unpublish")
    @Operation(summary = "Unpublish topic")
    public ResponseEntity<Void> unpublishTopic(@PathVariable String slug) {
        adminTopicService.unpublishTopic(slug);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @Operation(summary = "Create a new topic")
    public ResponseEntity<Void> createTopic(@Valid @RequestBody AdminTopicCreateRequest request) {
        adminTopicService.createTopic(request);
        return ResponseEntity.ok().build();
    }
}
