package com.devmastery.progress.repository;

import com.devmastery.progress.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, UUID> {
    Optional<LessonCompletion> findByUserIdAndLessonId(UUID userId, UUID lessonId);
}
