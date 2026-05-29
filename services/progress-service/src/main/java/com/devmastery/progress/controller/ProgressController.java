package com.devmastery.progress.controller;

import com.devmastery.progress.dto.LayerCompletionRequest;
import com.devmastery.progress.dto.MarkCompleteRequest;
import com.devmastery.progress.dto.ReviewRatingRequest;
import com.devmastery.progress.service.GamificationService;
import com.devmastery.progress.service.ProgressService;
import com.devmastery.progress.service.SpacedReviewService;
import com.devmastery.progress.service.CertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final GamificationService gamificationService;
    private final SpacedReviewService spacedReviewService;
    private final CertificateService certificateService;

    // Ideally userId comes from the JWT via Spring Security Context.
    // For local testing in Phase 1B, we can accept it as a header or just use a mock if auth isn't fully propagated yet.
    @PostMapping("/complete")
    public ResponseEntity<Void> markLessonComplete(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody MarkCompleteRequest request) {
        progressService.markLessonComplete(userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/topics/{slug}/start")
    public ResponseEntity<Void> startTopic(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String slug) {
        progressService.startTopic(userId, slug);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/topics/{slug}/complete")
    public ResponseEntity<Void> completeTopic(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String slug) {
        progressService.completeTopic(userId, slug);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/layers/complete")
    public ResponseEntity<Void> completeLayer(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody LayerCompletionRequest request) {
        gamificationService.processLayerCompletion(userId, request.topicId(), request.layerName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reviews/due")
    public ResponseEntity<Object> getDueReviews(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(spacedReviewService.getDueReviews(userId));
    }

    @PostMapping("/reviews/{topicId}")
    public ResponseEntity<Void> submitReview(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID topicId,
            @Valid @RequestBody ReviewRatingRequest request) {
        spacedReviewService.processReview(userId, topicId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/streak")
    public ResponseEntity<Object> getStreak(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(progressService.getUserStreak(userId));
    }
    
    @GetMapping("/summary")
    public ResponseEntity<Object> getSummary(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(progressService.getUserSummary(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Object> getStats(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(progressService.getStats(userId));
    }

    @GetMapping
    public ResponseEntity<Object> getProgress(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(progressService.getUserProgress(userId));
    }

    @GetMapping("/internal/progress/{userId}/path/{pathSlug}")
    public ResponseEntity<Map<String, Boolean>> getPathProgress(
            @PathVariable UUID userId,
            @PathVariable String pathSlug) {
        return ResponseEntity.ok(progressService.getPathProgress(userId, pathSlug));
    }

    @GetMapping(value = "/certificates/{pathSlug}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getCertificate(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable String pathSlug,
            @RequestParam(defaultValue = "Student Developer") String userName) {
        // In a real app, verify the user has 100% completed the path before generating
        byte[] pdf = certificateService.generateCertificate(userId, userName, pathSlug);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", pathSlug + "-certificate.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }
}
