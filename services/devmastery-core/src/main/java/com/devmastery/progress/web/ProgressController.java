package com.devmastery.progress.web;

import com.devmastery.progress.api.ProgressService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/progress")
public class ProgressController {

    private final ProgressService progress;
    public ProgressController(ProgressService progress) { this.progress = progress; }

    @GetMapping("/summary")
    public ProgressService.ProgressSummary summary(@AuthenticationPrincipal UUID userId) {
        return progress.summary(userId);
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
}
