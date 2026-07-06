package com.devmastery.community.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

interface CommentRepository extends JpaRepository<CommentEntity, UUID> {

    /** Top-level comments for a topic, visible (not deleted, not flagged). */
    @Query("""
           SELECT c FROM CommentEntity c
           WHERE c.topicSlug = :slug
             AND c.parentId IS NULL
             AND c.isDeleted = false
             AND c.isFlagged = false
           ORDER BY c.upvotes DESC, c.createdAt DESC
           """)
    List<CommentEntity> findTopLevel(@Param("slug") String topicSlug, Pageable pageable);

    /** Direct replies to a parent comment. */
    @Query("""
           SELECT c FROM CommentEntity c
           WHERE c.parentId = :parentId
             AND c.isDeleted = false
             AND c.isFlagged = false
           ORDER BY c.createdAt ASC
           """)
    List<CommentEntity> findReplies(@Param("parentId") UUID parentId);

    /** Count direct replies (used for reply-count badge). */
    @Query("SELECT COUNT(c) FROM CommentEntity c WHERE c.parentId = :parentId AND c.isDeleted = false")
    int countReplies(@Param("parentId") UUID parentId);

    @Modifying
    @Query("UPDATE CommentEntity c SET c.upvotes = c.upvotes + 1, c.updatedAt = CURRENT_TIMESTAMP WHERE c.id = :id")
    void incrementUpvotes(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE CommentEntity c SET c.upvotes = GREATEST(c.upvotes - 1, 0), c.updatedAt = CURRENT_TIMESTAMP WHERE c.id = :id")
    void decrementUpvotes(@Param("id") UUID id);
}

