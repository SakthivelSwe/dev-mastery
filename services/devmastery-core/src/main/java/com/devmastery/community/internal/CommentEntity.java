package com.devmastery.community.internal;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "topic_comments")
class CommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "topic_slug", nullable = false)
    private String topicSlug;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false)
    private String body;

    @Column(nullable = false)
    private int upvotes = 0;

    @Column(name = "is_flagged", nullable = false)
    private boolean isFlagged = false;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // ── getters / setters ──────────────────────────────────────────

    UUID getId()                          { return id; }
    String getTopicSlug()                 { return topicSlug; }
    UUID getUserId()                      { return userId; }
    UUID getParentId()                    { return parentId; }
    String getBody()                      { return body; }
    int getUpvotes()                      { return upvotes; }
    boolean isFlagged()                   { return isFlagged; }
    boolean isDeleted()                   { return isDeleted; }
    Instant getCreatedAt()                { return createdAt; }
    Instant getUpdatedAt()                { return updatedAt; }

    void setTopicSlug(String v)           { topicSlug = v; }
    void setUserId(UUID v)                { userId = v; }
    void setParentId(UUID v)              { parentId = v; }
    void setBody(String v)                { body = v; }
    void setUpvotes(int v)                { upvotes = v; }
    void setFlagged(boolean v)            { isFlagged = v; }
    void setDeleted(boolean v)            { isDeleted = v; }
    void setUpdatedAt(Instant v)          { updatedAt = v; }
}

