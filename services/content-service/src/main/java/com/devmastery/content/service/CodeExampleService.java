package com.devmastery.content.service;

import com.devmastery.content.dto.CodeExampleResponse;
import com.devmastery.content.entity.CodeExample;
import com.devmastery.content.exception.ResourceNotFoundException;
import com.devmastery.content.repository.CodeExampleBySlugRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for the tier-aware Code Lab API.
 *
 * All read methods are @Cacheable against Valkey (Redis) with a 6-hour TTL
 * configured in CacheConfig. The cache key includes slug + tier + language
 * to ensure no cross-contamination between different combinations.
 */
@Service
@Transactional(readOnly = true)
public class CodeExampleService {

    private final CodeExampleBySlugRepository repository;

    public CodeExampleService(CodeExampleBySlugRepository repository) {
        this.repository = repository;
    }

    /**
     * Fetch a code example by topic slug, difficulty tier, and programming language.
     *
     * Cache key: "array-basics:easy:java" → TTL 6h (configured in CacheConfig).
     *
     * @param topicSlug e.g. "array-basics"
     * @param tier      e.g. "easy" | "intermediate" | "expert" | "advanced"
     * @param language  e.g. "java" | "python" | "javascript" | "cpp"
     * @return CodeExampleResponse with full code, explanation, tricks
     * @throws ResourceNotFoundException if no published example exists
     */
    @Cacheable(
        value  = "code-examples",
        key    = "#topicSlug.concat(':').concat(#tier).concat(':').concat(#language)"
    )
    public CodeExampleResponse getCodeExample(String topicSlug, String tier, String language) {
        CodeExample entity = repository
                .findByTopicSlugAndDifficultyTierAndLanguageAndIsPublishedTrue(topicSlug, tier, language)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No code example found for topic '%s' at '%s' tier in '%s'",
                                topicSlug, tier, language)
                ));

        return CodeExampleResponse.fromEntity(entity);
    }

    /**
     * Returns the list of published languages for a given topic slug + tier.
     * Used to determine which language tabs are enabled in the frontend.
     *
     * Example: ["java"] — only Java is available for array-basics easy tier.
     *
     * Cache key: "langs:array-basics:easy" → TTL 6h.
     *
     * @param topicSlug e.g. "array-basics"
     * @param tier      e.g. "easy"
     * @return sorted list of language strings
     */
    @Cacheable(
        value = "code-examples",
        key   = "'langs:'.concat(#topicSlug).concat(':').concat(#tier)"
    )
    public List<String> getAvailableLanguages(String topicSlug, String tier) {
        return repository.findDistinctLanguagesByTopicSlugAndDifficultyTier(topicSlug, tier);
    }
}
