package com.devmastery.patterns.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface PatternProblemRepository extends JpaRepository<PatternProblemEntity, UUID> {
    /**
     * Difficulty CASE keeps Easy/Medium/Hard in natural learning order,
     * with anything else (NULL or extra labels) at the end.
     */
    @org.springframework.data.jpa.repository.Query("""
           select p from PatternProblemEntity p
           where p.patternId = :patternId
           order by
             case lower(coalesce(p.difficulty, ''))
               when 'easy'   then 1
               when 'medium' then 2
               when 'hard'   then 3
               else               4
             end,
             p.title
           """)
    List<PatternProblemEntity> findByPatternIdOrdered(
            @org.springframework.data.repository.query.Param("patternId") UUID patternId);
}

