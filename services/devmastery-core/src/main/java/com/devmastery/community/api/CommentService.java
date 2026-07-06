package com.devmastery.community.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Public API for topic-scoped community discussions.
 * <p>
 * Supports two-level threading (top-level comment + replies).
 * All mutations are guarded by userId — callers must resolve it from the JWT
 * before calling.
 */
public interface CommentService {

    /** Return top-level comments for a topic (sorted by upvotes desc, then created_at). */
    List<CommentView> listTopLevel(String topicSlug, int page, int pageSize);

    /** Return direct replies for a given parent comment. */
    List<CommentView> listReplies(UUID parentId);

    /** Post a new comment (parentId = null → top-level). */
    CommentView post(UUID userId, String topicSlug, UUID parentId, String body);

    /** Edit body — only allowed within 15 minutes of creation. Returns updated view. */
    CommentView edit(UUID userId, UUID commentId, String newBody);

    /** Soft-delete a comment (body replaced with "[deleted]"). */
    void delete(UUID userId, UUID commentId);

    /** Toggle upvote. Returns new upvote count. */
    int toggleUpvote(UUID userId, UUID commentId);

    /** Flag a comment for moderation. */
    void flag(UUID userId, UUID commentId);

    // ── View record ─────────────────────────────────────────────────

    record CommentView(
            UUID     id,
            UUID     parentId,
            String   topicSlug,
            UUID     authorId,
            String   authorName,     // display name or "Anonymous"
            String   body,
            int      upvotes,
            boolean  isFlagged,
            boolean  isDeleted,
            boolean  editedByAuthor, // true if body was ever updated
            Instant  createdAt,
            Instant  updatedAt,
            int      replyCount,
            boolean  upvotedByMe     // caller has upvoted this comment
    ) {}
}

