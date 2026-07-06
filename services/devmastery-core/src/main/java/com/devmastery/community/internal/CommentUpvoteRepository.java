package com.devmastery.community.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;
import java.util.UUID;

interface CommentUpvoteRepository extends JpaRepository<CommentUpvoteEntity, CommentUpvoteKey> {

    boolean existsByIdUserIdAndIdCommentId(UUID userId, UUID commentId);

    void deleteByIdUserIdAndIdCommentId(UUID userId, UUID commentId);

    /** Return comment IDs that the given user has upvoted within a set. */
    @Query("SELECT u.id.commentId FROM CommentUpvoteEntity u WHERE u.id.userId = :userId AND u.id.commentId IN :ids")
    Set<UUID> findUpvotedByUser(@Param("userId") UUID userId, @Param("ids") Set<UUID> ids);
}

