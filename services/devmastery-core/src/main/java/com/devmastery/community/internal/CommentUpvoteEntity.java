package com.devmastery.community.internal;

import jakarta.persistence.*;

import java.util.UUID;

/** Tracks which users have upvoted which comment (prevents double-voting). */
@Entity
@Table(name = "comment_upvotes")
class CommentUpvoteEntity {

    @EmbeddedId
    private CommentUpvoteKey id;

    CommentUpvoteEntity() {}

    CommentUpvoteEntity(UUID userId, UUID commentId) {
        this.id = new CommentUpvoteKey(userId, commentId);
    }

    CommentUpvoteKey getId() { return id; }
}

