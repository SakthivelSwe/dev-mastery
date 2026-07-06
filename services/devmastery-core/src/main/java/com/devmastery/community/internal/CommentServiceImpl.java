package com.devmastery.community.internal;

import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.community.api.CommentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
class CommentServiceImpl implements CommentService {

    private static final int EDIT_GRACE_MINUTES = 15;

    private final CommentRepository comments;
    private final CommentUpvoteRepository upvotes;
    private final JdbcTemplate jdbc;

    CommentServiceImpl(CommentRepository comments,
                       CommentUpvoteRepository upvotes,
                       JdbcTemplate jdbc) {
        this.comments = comments;
        this.upvotes  = upvotes;
        this.jdbc     = jdbc;
    }

    // ── reads ────────────────────────────────────────────────────

    @Override
    public List<CommentView> listTopLevel(String topicSlug, int page, int pageSize) {
        var page_ = PageRequest.of(page, pageSize);
        List<CommentEntity> rows = comments.findTopLevel(topicSlug, page_);
        return toViews(rows, null);
    }

    @Override
    public List<CommentView> listReplies(UUID parentId) {
        List<CommentEntity> rows = comments.findReplies(parentId);
        return toViews(rows, null);
    }

    // ── writes ───────────────────────────────────────────────────

    @Override
    @Transactional
    public CommentView post(UUID userId, String topicSlug, UUID parentId, String body) {
        if (parentId != null) {
            // Validate parent exists and is same topic
            comments.findById(parentId)
                    .filter(p -> p.getTopicSlug().equals(topicSlug) && !p.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found: " + parentId));
        }

        CommentEntity c = new CommentEntity();
        c.setTopicSlug(topicSlug);
        c.setUserId(userId);
        c.setParentId(parentId);
        c.setBody(sanitize(body));
        comments.save(c);
        return toView(c, false, 0);
    }

    @Override
    @Transactional
    public CommentView edit(UUID userId, UUID commentId, String newBody) {
        CommentEntity c = requireOwned(userId, commentId);
        long minutesSince = Duration.between(c.getCreatedAt(), Instant.now()).toMinutes();
        if (minutesSince > EDIT_GRACE_MINUTES) {
            throw new IllegalStateException("Comments can only be edited within " + EDIT_GRACE_MINUTES + " minutes of posting.");
        }
        c.setBody(sanitize(newBody));
        c.setUpdatedAt(Instant.now());
        comments.save(c);
        boolean upvotedByMe = upvotes.existsByIdUserIdAndIdCommentId(userId, commentId);
        return toView(c, upvotedByMe, comments.countReplies(commentId));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID commentId) {
        CommentEntity c = requireOwned(userId, commentId);
        c.setDeleted(true);
        c.setBody("[deleted]");
        c.setUpdatedAt(Instant.now());
        comments.save(c);
    }

    @Override
    @Transactional
    public int toggleUpvote(UUID userId, UUID commentId) {
        CommentEntity c = comments.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (upvotes.existsByIdUserIdAndIdCommentId(userId, commentId)) {
            upvotes.deleteByIdUserIdAndIdCommentId(userId, commentId);
            comments.decrementUpvotes(commentId);
            return c.getUpvotes() - 1;
        } else {
            upvotes.save(new CommentUpvoteEntity(userId, commentId));
            comments.incrementUpvotes(commentId);
            return c.getUpvotes() + 1;
        }
    }

    @Override
    @Transactional
    public void flag(UUID userId, UUID commentId) {
        CommentEntity c = comments.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        c.setFlagged(true);
        c.setUpdatedAt(Instant.now());
        comments.save(c);
    }

    // ── helpers ──────────────────────────────────────────────────

    private CommentEntity requireOwned(UUID userId, UUID commentId) {
        CommentEntity c = comments.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!c.getUserId().equals(userId)) {
            throw new SecurityException("Not your comment");
        }
        return c;
    }

    private List<CommentView> toViews(List<CommentEntity> rows, UUID requesterId) {
        if (rows.isEmpty()) return List.of();

        Set<UUID> ids = rows.stream().map(CommentEntity::getId).collect(Collectors.toSet());
        Set<UUID> myUpvotes = (requesterId != null)
                ? upvotes.findUpvotedByUser(requesterId, ids)
                : Set.of();

        return rows.stream()
                .map(c -> toView(c, myUpvotes.contains(c.getId()), comments.countReplies(c.getId())))
                .toList();
    }

    private CommentView toView(CommentEntity c, boolean upvotedByMe, int replyCount) {
        String authorName = resolveName(c.getUserId());
        boolean edited = !c.getCreatedAt().equals(c.getUpdatedAt());
        return new CommentView(
                c.getId(), c.getParentId(), c.getTopicSlug(),
                c.getUserId(), authorName, c.getBody(),
                c.getUpvotes(), c.isFlagged(), c.isDeleted(),
                edited, c.getCreatedAt(), c.getUpdatedAt(),
                replyCount, upvotedByMe);
    }

    private String resolveName(UUID userId) {
        try {
            return jdbc.queryForObject(
                    """
                    SELECT COALESCE(raw_user_meta_data->>'full_name',
                                   raw_user_meta_data->>'name',
                                   split_part(email, '@', 1),
                                   'Anonymous')
                    FROM auth.users WHERE id = ?::uuid
                    """,
                    String.class, userId.toString());
        } catch (Exception e) {
            return "Anonymous";
        }
    }

    /** Basic trim + length guard */
    private static String sanitize(String body) {
        if (body == null) throw new IllegalArgumentException("Comment body cannot be null");
        String trimmed = body.trim();
        if (trimmed.isEmpty()) throw new IllegalArgumentException("Comment body cannot be empty");
        if (trimmed.length() > 4000) throw new IllegalArgumentException("Comment body exceeds 4000 characters");
        return trimmed;
    }
}

