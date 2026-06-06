package com.devmastery.content.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface LearningPathRepository extends JpaRepository<LearningPathEntity, UUID> {
    Optional<LearningPathEntity> findBySlug(String slug);
}
