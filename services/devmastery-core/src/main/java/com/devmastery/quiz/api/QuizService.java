package com.devmastery.quiz.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface QuizService {

    QuizView getQuiz(UUID quizId);

    QuizResult submit(UUID userId, UUID quizId, Map<UUID, String> answers);

    /** Current adaptive difficulty level (1–4) for this user+topic. */
    int getDifficultyLevel(UUID userId, String topicSlug);

    record QuizView(UUID id, String title, UUID topicId, List<QuestionView> questions) { }

    record QuestionView(UUID id, String prompt, List<String> options) { }

    record QuizResult(UUID quizId, int score, int maxScore, Map<UUID, Boolean> perQuestion,
                      int newDifficultyLevel) { }
}
