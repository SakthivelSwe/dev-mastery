package com.devmastery.content.repository;

import com.devmastery.content.model.ProblemPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemPatternRepository extends JpaRepository<ProblemPattern, UUID> {
    Optional<ProblemPattern> findBySlug(String slug);
}
