package com.devmastery.content.controller;

import com.devmastery.content.service.CodeSeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/admin/seed")
@RequiredArgsConstructor
public class CodeSeedController {

    private final CodeSeedService codeSeedService;

    /**
     * POST /v1/admin/seed/ingest
     * Body: { "artifactPath": "/path/to/artifact.json" }
     */
    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingestArtifact(@RequestBody Map<String, String> request) {
        String artifactPath = request.get("artifactPath");
        if (artifactPath == null || artifactPath.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "artifactPath is required"));
        }
        
        // This is async in a real app, but synchronous for prototype simplicity
        codeSeedService.ingestSeedArtifact(artifactPath);
        return ResponseEntity.ok(Map.of("status", "Ingestion triggered for " + artifactPath));
    }
    
    /**
     * POST /v1/admin/seed/generate/{topicSlug}
     */
    @PostMapping("/generate/{topicSlug}")
    public ResponseEntity<Map<String, String>> generateForTopic(@PathVariable String topicSlug) {
        codeSeedService.generateExamplesForTopic(topicSlug);
        return ResponseEntity.ok(Map.of("status", "AI generation triggered for " + topicSlug));
    }
}
