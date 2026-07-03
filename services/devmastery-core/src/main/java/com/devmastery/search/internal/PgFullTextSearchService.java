package com.devmastery.search.internal;

import com.devmastery.search.api.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * PostgreSQL text search using plain {@code ILIKE} against the current schema.
 *
 * <p>Historical note: an earlier version of this class relied on {@code tsvector}
 * columns and per-section text columns on the {@code topics} table
 * ({@code why}, {@code theory}, ...). Both were removed when sections were
 * normalized into the {@code lessons} table, so those queries now fail with
 * "column t.theory does not exist". The current implementation joins across
 * {@code topics}, {@code lessons} and {@code code_examples} using only columns
 * that exist today.
 */
@Service
class PgFullTextSearchService implements SearchService {

    @PersistenceContext
    private EntityManager em;

    @Override
    @SuppressWarnings("unchecked")
    public List<SearchHit> search(String query, int limit) {
        if (query == null || query.isBlank()) return List.of();

        // Wrap once so we can bind a single parameter into every LIKE.
        String needle = "%" + query.trim().toLowerCase() + "%";

        String sql = """
            SELECT id, type, slug, title, snippet, rank FROM (
              SELECT t.id AS id,
                     'TOPIC'::text AS type,
                     t.slug        AS slug,
                     t.title       AS title,
                     left(coalesce(t.description, ''), 200) AS snippet,
                     3.0 AS rank
              FROM topics t
              WHERE t.is_published = true
                AND (lower(t.title) LIKE :q
                     OR lower(coalesce(t.description, '')) LIKE :q)
              UNION ALL
              SELECT l.id,
                     'LESSON',
                     t.slug,
                     t.title || ' / ' || l.section_type,
                     left(l.content_mdx, 200),
                     2.0
              FROM lessons l
              JOIN topics t ON t.id = l.topic_id
              WHERE t.is_published = true
                AND l.is_published = true
                AND lower(l.content_mdx) LIKE :q
              UNION ALL
              SELECT c.id,
                     'EXAMPLE',
                     t.slug,
                     t.title || ' (' || coalesce(c.language, '') || ')',
                     left(coalesce(c.explanation, c.code, ''), 200),
                     1.0
              FROM code_examples c
              JOIN topics t ON t.id = c.topic_id
              WHERE t.is_published = true
                AND (lower(coalesce(c.explanation, '')) LIKE :q
                     OR lower(coalesce(c.code, ''))        LIKE :q)
            ) AS hits
            ORDER BY rank DESC, title
            LIMIT :lim
            """;

        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("q", needle)
                .setParameter("lim", limit)
                .getResultList();

        return rows.stream().map(r -> new SearchHit(
                (UUID) r[0],
                (String) r[1],
                (String) r[2],
                (String) r[3],
                (String) r[4],
                ((Number) r[5]).doubleValue()
        )).toList();
    }
}
