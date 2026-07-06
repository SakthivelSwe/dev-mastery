package com.devmastery.community.web;

import com.devmastery.community.api.CommentService;
import com.devmastery.community.api.CommentService.CommentView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Community discussion endpoints.
 *
 * <pre>
 * GET  /v1/comments/{topicSlug}            — list top-level comments (paginated)
 * GET  /v1/comments/{topicSlug}/{id}/replies — list replies for a comment
 * POST /v1/comments/{topicSlug}            — post new comment (auth required)
 * PUT  /v1/comments/{id}                   — edit within 15 min (auth required)
 * DELETE /v1/comments/{id}                 — soft-delete (auth required)
 * POST /v1/comments/{id}/upvote            — toggle upvote (auth required)
 * POST /v1/comments/{id}/flag              — flag for moderation (auth required)
 * </pre>
 */
@RestController
@RequestMapping("/v1/comments")
class CommentController {

    private final CommentService service;

    CommentController(CommentService service) {
        this.service = service;
    }

    @GetMapping("/{topicSlug}")
    List<CommentView> listTopLevel(
            @PathVariable String topicSlug,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listTopLevel(topicSlug, page, Math.min(size, 50));
    }

    @GetMapping("/{topicSlug}/{id}/replies")
    List<CommentView> listReplies(@PathVariable UUID id) {
        return service.listReplies(id);
    }

    @PostMapping("/{topicSlug}")
    ResponseEntity<CommentView> post(
            @PathVariable String topicSlug,
            @RequestBody @Valid PostRequest req,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        CommentView view = service.post(userId, topicSlug, req.parentId(), req.body());
        return ResponseEntity
                .created(URI.create("/v1/comments/" + topicSlug + "/" + view.id()))
                .body(view);
    }

    @PutMapping("/{id}")
    ResponseEntity<CommentView> edit(
            @PathVariable UUID id,
            @RequestBody @Valid EditRequest req,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.edit(userId, id, req.body()));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upvote")
    ResponseEntity<UpvoteResponse> toggleUpvote(
            @PathVariable UUID id,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        int newCount = service.toggleUpvote(userId, id);
        return ResponseEntity.ok(new UpvoteResponse(newCount));
    }

    @PostMapping("/{id}/flag")
    ResponseEntity<Void> flag(
            @PathVariable UUID id,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.flag(userId, id);
        return ResponseEntity.ok().build();
    }

    // ── request / response records ────────────────────────────────

    record PostRequest(
            UUID parentId,        // nullable — null = top-level
            @NotBlank @Size(min = 1, max = 4000) String body) {}

    record EditRequest(
            @NotBlank @Size(min = 1, max = 4000) String body) {}

    record UpvoteResponse(int upvotes) {}
}

