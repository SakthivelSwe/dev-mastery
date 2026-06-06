package com.devmastery.content.internal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface TopicRepository extends JpaRepository<TopicEntity, UUID> {

    Optional<TopicEntity> findBySlugAndStatus(String slug, String status);

    @Query("""
           select t from TopicEntity t
           where (:pathId is null or t.pathId = :pathId)
             and (:level  is null or t.level  = :level)
             and t.status = 'published'
           order by t.displayOrder
           """)
    List<TopicEntity> search(@Param("pathId") UUID pathId,
                             @Param("level")  Integer level,
                             Pageable pageable);
}
