package com.devmastery.content.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface LessonCompletionRepository extends JpaRepository<LessonCompletionEntity, UUID> {
    Optional<LessonCompletionEntity> findByUserIdAndLessonId(UUID userId, UUID lessonId);
}
