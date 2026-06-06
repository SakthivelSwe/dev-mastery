package com.devmastery.quiz.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface QuizRepository extends JpaRepository<QuizEntity, UUID> { }

interface QuizQuestionRepository extends JpaRepository<QuizQuestionEntity, UUID> {
    List<QuizQuestionEntity> findByQuizIdOrderByDisplayOrder(UUID quizId);
}
