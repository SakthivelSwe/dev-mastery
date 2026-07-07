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

    /**
     * Fetch junction rows (topic_id, level_override, display_order) for a path,
     * limited to published topics. Includes both single-owner mirror rows and
     * cross-listed topics whose primary path_id points elsewhere.
     *
     * Callers hydrate {@link Topic} entities via {@link #findAllById} and
     * apply level/display overrides in the service layer.
     *
     * Ordered by display_order (deterministic layout on the roadmap).
     */
    @Query(value = """
           SELECT tp.topic_id AS topic_id,
                  tp.level_override AS level_override,
                  tp.display_order AS display_order
           FROM topic_paths tp
           JOIN topics t ON t.id = tp.topic_id
           JOIN learning_paths lp ON lp.id = tp.path_id
           WHERE lp.slug = :pathSlug
             AND t.is_published = true
           ORDER BY COALESCE(tp.display_order, t.order_index) ASC, t.order_index ASC
           """, nativeQuery = true)
    List<Object[]> findJunctionRowsByPathSlug(@Param("pathSlug") String pathSlug);
}
