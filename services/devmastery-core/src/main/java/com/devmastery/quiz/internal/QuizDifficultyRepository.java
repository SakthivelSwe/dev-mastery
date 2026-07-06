package com.devmastery.quiz.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

interface QuizDifficultyRepository extends JpaRepository<QuizDifficultyEntity, QuizDifficultyKey> {
    Optional<QuizDifficultyEntity> findByIdUserIdAndIdTopicSlug(UUID userId, String topicSlug);
}

