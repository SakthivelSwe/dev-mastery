package com.devmastery.admin.web;

import com.devmastery.admin.api.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService admin;
    public AdminController(AdminService admin) { this.admin = admin; }

    @GetMapping("/dashboard")
    public AdminService.DashboardStats dashboard() { return admin.getDashboard(); }

    // ── Single-section update ─────────────────────────────────────────────────
    @PutMapping("/topics/{slug}/section")
    public ResponseEntity<Void> updateSection(@PathVariable String slug,
                                               @RequestBody SectionUpdate body) {
        admin.updateTopicSection(slug, body.section(), body.content());
        return ResponseEntity.ok().build();
    }

    // ── Batch layer import (called by importContent.ts script) ───────────────
    /**
     * POST /v1/admin/topics/layers/batch
     * Body: { "topics": [ { "slug": "...", "layers": { "why": "...", "code": "..." } } ] }
     */
    @PostMapping("/topics/layers/batch")
    public ResponseEntity<BatchResult> importLayers(@RequestBody BatchImportRequest body) {
        if (body == null || body.topics() == null || body.topics().isEmpty()) {
            return ResponseEntity.badRequest().body(new BatchResult(0, "Empty payload"));
        }
        List<AdminService.TopicLayerImport> imports = body.topics().stream()
                .map(t -> new AdminService.TopicLayerImport(t.slug(), t.layers()))
                .toList();
        admin.importTopicLayers(imports);
        return ResponseEntity.ok(new BatchResult(imports.size(), "OK"));
    }

    // ── Runner templates ──────────────────────────────────────────────────────
    @GetMapping("/runners")
    public List<AdminService.RunnerTemplate> runners() { return admin.getRunnerTemplates(); }

    @PutMapping("/runners/{language}")
    public ResponseEntity<Void> upsertRunner(@PathVariable String language,
                                              @RequestBody RunnerUpdate body) {
        admin.upsertRunnerTemplate(language, body.name(), body.urlTemplate());
        return ResponseEntity.ok().build();
    }

    // ── Request / response records ────────────────────────────────────────────
    public record SectionUpdate(String section, String content) { }
    public record RunnerUpdate(String name, String urlTemplate) { }

    public record BatchImportRequest(List<TopicEntry> topics) { }
    public record TopicEntry(String slug, Map<String, String> layers) { }
    public record BatchResult(int count, String status) { }
}


