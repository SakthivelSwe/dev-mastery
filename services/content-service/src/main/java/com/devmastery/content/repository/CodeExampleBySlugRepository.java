package com.devmastery.content.repository;

import com.devmastery.content.entity.CodeExample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for slug-based CodeExample lookups.
 * Used by the Code Lab tier/language switcher API.
 *
 * For legacy topic-FK-based queries, see TopicRepository / LessonRepository.
 */
@Repository
public interface CodeExampleBySlugRepository extends JpaRepository<CodeExample, UUID> {

    /**
     * Find a published code example by topic slug, difficulty tier, and language.
     * This is the primary query for GET /v1/topics/{slug}/code?tier=easy&lang=java.
     */
    Optional<CodeExample> findByTopicSlugAndDifficultyTierAndLanguageAndIsPublishedTrue(
            String topicSlug,
            String difficultyTier,
            String language
    );

    /**
     * Find all published languages available for a given slug + tier.
     * Used by GET /v1/topics/{slug}/code/languages?tier=easy
     * to determine which language tabs should be enabled in the UI.
     */
    @Query("""
            SELECT DISTINCT c.language FROM CodeExample c
            WHERE c.topicSlug = :topicSlug
              AND c.difficultyTier = :tier
              AND c.isPublished = true
            ORDER BY c.language
            """)
    List<String> findDistinctLanguagesByTopicSlugAndDifficultyTier(
            @Param("topicSlug") String topicSlug,
            @Param("tier")      String tier
    );

    /**
     * Check if an example already exists for a given slug + tier + language.
     * Used by CodeSeedService to skip already-seeded combinations.
     */
    boolean existsByTopicSlugAndDifficultyTierAndLanguage(
            String topicSlug,
            String difficultyTier,
            String language
    );

    /**
     * Count how many tiers are seeded for a given slug.
     * Used by the seed job to determine if a topic is fully seeded (= 4 tiers).
     */
    @Query("SELECT COUNT(DISTINCT c.difficultyTier) FROM CodeExample c WHERE c.topicSlug = :topicSlug AND c.isPublished = true")
    long countPublishedTiersByTopicSlug(@Param("topicSlug") String topicSlug);
}
