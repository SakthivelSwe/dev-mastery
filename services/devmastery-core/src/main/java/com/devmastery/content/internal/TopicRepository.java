package com.devmastery.content.internal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface TopicRepository extends JpaRepository<TopicEntity, UUID> {

    Optional<TopicEntity> findBySlug(String slug);

    /** Back-compat shim — the {@code status} column was replaced by {@code is_published}. */
    default Optional<TopicEntity> findBySlugAndStatus(String slug, String status) {
        boolean wantPublished = "published".equalsIgnoreCase(status);
        return findBySlug(slug).filter(t -> t.isPublished() == wantPublished);
    }

    @Query("""
           select t from TopicEntity t
           where (:pathId is null or t.pathId = :pathId)
             and (:level  is null or t.level  = :level)
             and t.published = true
           order by t.displayOrder
           """)
    List<TopicEntity> search(@Param("pathId") UUID pathId,
                             @Param("level")  Integer level,
                             Pageable pageable);

    List<TopicEntity> findByPathIdAndPublishedTrueOrderByDisplayOrder(UUID pathId);
}
