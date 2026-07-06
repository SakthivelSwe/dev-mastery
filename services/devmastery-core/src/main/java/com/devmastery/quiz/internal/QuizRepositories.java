package com.devmastery.quiz.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

interface QuizRepository extends JpaRepository<QuizEntity, UUID> {
    @Query(value = "SELECT t.slug FROM topics t WHERE t.id = :topicId", nativeQuery = true)
    String findTopicSlugByTopicId(@Param("topicId") UUID topicId);
}

interface QuizQuestionRepository extends JpaRepository<QuizQuestionEntity, UUID> {
    List<QuizQuestionEntity> findByQuizIdOrderByDisplayOrder(UUID quizId);
}
