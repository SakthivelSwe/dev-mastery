package com.devmastery.community.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
class CommentUpvoteKey implements Serializable {

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "comment_id")
    private UUID commentId;

    CommentUpvoteKey() {}

    CommentUpvoteKey(UUID userId, UUID commentId) {
        this.userId    = userId;
        this.commentId = commentId;
    }

    UUID getUserId()    { return userId;    }
    UUID getCommentId() { return commentId; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommentUpvoteKey k)) return false;
        return Objects.equals(userId, k.userId) && Objects.equals(commentId, k.commentId);
    }

    @Override public int hashCode() { return Objects.hash(userId, commentId); }
}

