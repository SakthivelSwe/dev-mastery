package com.devmastery.content.repository;

import com.devmastery.content.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic> {

    Optional<Topic> findBySlug(String slug);

    /** All published topics in a path, ordered. */
    List<Topic> findByLearningPathIdAndIsPublishedTrueOrderByOrderIndexAsc(UUID pathId);

    /** Paginated published topics in a path. */
    Page<Topic> findByLearningPathIdAndIsPublishedTrue(UUID pathId, Pageable pageable);

    /** Fallback search query */
    Page<Topic> findByTitleContainingIgnoreCaseAndIsPublishedTrue(String title, Pageable pageable);

    /** Filter by level range (for skill-based recommendations). */
    @Query("""
           SELECT t FROM Topic t
           WHERE t.isPublished = true
           AND (:pathSlug IS NULL OR t.learningPath.slug = :pathSlug)
           AND (:level IS NULL OR t.level = :level)
           AND (:hasVisualizer IS NULL OR t.hasVisualizer = :hasVisualizer)
           ORDER BY t.learningPath.orderIndex ASC, t.orderIndex ASC
           """)
    Page<Topic> findWithFilters(
            @Param("pathSlug") String pathSlug,
            @Param("level") Integer level,
            @Param("hasVisualizer") Boolean hasVisualizer,
            Pageable pageable
    );

    /** Count published topics per path (for path metadata updates). */
    long countByLearningPathIdAndIsPublishedTrue(UUID pathId);

    boolean existsBySlug(String slug);
}
