package com.devmastery.patterns.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface ProblemPatternRepository extends JpaRepository<ProblemPatternEntity, UUID> {
    List<ProblemPatternEntity> findAllByOrderByNameAsc();
    Optional<ProblemPatternEntity> findBySlug(String slug);
}

