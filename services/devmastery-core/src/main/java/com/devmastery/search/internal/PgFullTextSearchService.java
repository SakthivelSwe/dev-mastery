package com.devmastery.search.internal;

import com.devmastery.search.api.SearchService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * PostgreSQL full-text search using {@code tsvector} columns and
 * GIN indexes (see Flyway migration {@code V19__fulltext_search.sql}).
 * Uses {@code plainto_tsquery} for safe user input and {@code ts_rank} for ordering.
 */
@Service
class PgFullTextSearchService implements SearchService {

    @PersistenceContext
    private EntityManager em;

    @Override
    @SuppressWarnings("unchecked")
    public List<SearchHit> search(String query, int limit) {
        if (query == null || query.isBlank()) return List.of();

        String sql = """
            SELECT id, type, slug, title, snippet, rank FROM (
              SELECT t.id, 'TOPIC'::text AS type, t.slug, t.title,
                     left(coalesce(t.theory, t.why, ''), 200) AS snippet,
                     ts_rank(t.search_vector, plainto_tsquery('english', :q)) AS rank
              FROM topics t
              WHERE t.search_vector @@ plainto_tsquery('english', :q)
                AND t.status = 'published'
              UNION ALL
              SELECT l.id, 'LESSON', t.slug, t.title || ' / ' || l.section,
                     left(l.content, 200),
                     ts_rank(l.search_vector, plainto_tsquery('english', :q))
              FROM lessons l JOIN topics t ON t.id = l.topic_id
              WHERE l.search_vector @@ plainto_tsquery('english', :q)
              UNION ALL
              SELECT c.id, 'EXAMPLE', t.slug, t.title || ' (' || c.language || ')',
                     left(coalesce(c.explanation, c.code), 200),
                     ts_rank(c.search_vector, plainto_tsquery('english', :q))
              FROM code_examples c JOIN topics t ON t.id = c.topic_id
              WHERE c.search_vector @@ plainto_tsquery('english', :q)
            ) AS hits
            ORDER BY rank DESC
            LIMIT :lim
            """;

        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("q", query)
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
