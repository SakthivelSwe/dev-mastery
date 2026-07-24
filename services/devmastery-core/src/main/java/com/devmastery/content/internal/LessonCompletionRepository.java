package com.devmastery.content.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface LessonCompletionRepository extends JpaRepository<LessonCompletionEntity, UUID> {
    Optional<LessonCompletionEntity> findByUserIdAndLessonId(UUID userId, UUID lessonId);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from LessonCompletionEntity e where e.userId = ?1")
    void deleteByUserId(UUID userId);
}
