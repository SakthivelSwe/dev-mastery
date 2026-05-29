package com.devmastery.progress.repository;

import com.devmastery.progress.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, UUID> {
    Optional<LessonCompletion> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    @Query("SELECT COALESCE(SUM(l.timeSpentSecs), 0) FROM LessonCompletion l WHERE l.userId = :userId")
    long getTotalTimeSpentByUserId(@Param("userId") UUID userId);
}
