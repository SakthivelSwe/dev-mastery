package com.devmastery.progress.web;

import com.devmastery.common.events.LessonCompletedEvent;
import com.devmastery.progress.api.ProgressService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/progress")
public class ProgressController {

    private final ProgressService progress;
    private final ApplicationEventPublisher events;

    public ProgressController(ProgressService progress, ApplicationEventPublisher events) {
        this.progress = progress;
        this.events   = events;
    }

    @GetMapping("/summary")
    public ProgressService.ProgressSummary summary(@AuthenticationPrincipal UUID userId) {
        return progress.summary(userId);
    }

    /**
     * Called by the frontend "Mark complete" button for each lesson layer.
     * Payload: { topicSlug: string, layer: string, timeSpentSecs: number }
     * Awards 10 XP per layer completion and returns the updated summary so
     * the XP flash on the topic page shows the correct number.
     */
    @PostMapping("/layer-complete")
    public ResponseEntity<Map<String, Object>> layerComplete(
            @AuthenticationPrincipal UUID userId,
            @RequestBody LayerCompleteRequest req) {

        // Publish a LessonCompletedEvent — ProgressServiceImpl handles XP + streak.
        // lessonId/topicId are null here (we route by topicSlug from frontend);
        // the event listener still awards LESSON_XP (10 XP) and bumps the streak.
        events.publishEvent(new LessonCompletedEvent(userId, null, null, java.time.Instant.now()));

        ProgressService.ProgressSummary updated = progress.summary(userId);
        return ResponseEntity.ok(Map.of(
                "xpAwarded",       10,
                "totalXp",         updated.xp(),
                "topicsCompleted", updated.topicsCompleted()
        ));
    }

    @GetMapping("/reviews/due")
    public List<ProgressService.ReviewItem> due(@AuthenticationPrincipal UUID userId) {
        return progress.dueReviews(userId);
    }

    @PostMapping("/reviews/{topicId}")
    public void submit(@AuthenticationPrincipal UUID userId,
                       @PathVariable UUID topicId,
                       @RequestBody RatingRequest req) {
        progress.submitReview(userId, topicId, req.rating());
    }

    public record RatingRequest(int rating) { }
    public record LayerCompleteRequest(String topicSlug, String layer, int timeSpentSecs) { }
}

