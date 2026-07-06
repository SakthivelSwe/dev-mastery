package com.devmastery.ai.web;

import com.devmastery.ai.api.InterviewService;
import com.devmastery.ai.api.InterviewService.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Mock-interview session CRUD. Frontend posts the transcript + AI-generated
 * scorecard here at end of interview; user history is read back on demand.
 */
@RestController
@RequestMapping("/v1/interviews")
class InterviewController {

    private final InterviewService interviews;

    InterviewController(InterviewService interviews) { this.interviews = interviews; }

    @PostMapping
    ResponseEntity<Map<String, UUID>> save(
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId,
            @RequestBody SaveBody body) {
        if (userId == null) return ResponseEntity.status(401).build();
        var id = interviews.save(new SaveRequest(
                userId, body.topicSlug(), body.targetLevel(),
                body.startedAt(), body.endedAt() == null ? Instant.now() : body.endedAt(),
                body.transcript(), body.scoreCard()));
        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping
    List<SessionSummary> list(
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return List.of();
        return interviews.listForUser(userId);
    }

    @GetMapping("/{id}")
    ResponseEntity<SessionDetail> detail(
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId,
            @PathVariable UUID id) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(interviews.get(userId, id));
    }

    /**
     * Parses the interviewer's final markdown scorecard and persists the
     * structured result on the given session.
     */
    @PostMapping("/{id}/grade")
    ResponseEntity<ScoreCard> grade(
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId,
            @PathVariable UUID id,
            @RequestBody GradeBody body) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(interviews.grade(userId, id, body.scorecardText()));
    }

    // ─── Request payload ─────────────────────────────────────────

    public record SaveBody(String topicSlug, String targetLevel,
                           Instant startedAt, Instant endedAt,
                           List<TranscriptTurn> transcript,
                           ScoreCard scoreCard) { }

    public record GradeBody(String scorecardText) { }
}

