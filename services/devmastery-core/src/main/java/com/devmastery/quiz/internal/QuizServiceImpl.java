package com.devmastery.quiz.internal;

import com.devmastery.common.events.QuizSubmittedEvent;
import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.quiz.api.QuizService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class QuizServiceImpl implements QuizService {

    private final QuizRepository quizzes;
    private final QuizQuestionRepository questions;
    private final ApplicationEventPublisher events;

    QuizServiceImpl(QuizRepository quizzes, QuizQuestionRepository questions,
                    ApplicationEventPublisher events) {
        this.quizzes = quizzes; this.questions = questions; this.events = events;
    }

    @Override
    public QuizView getQuiz(UUID quizId) {
        QuizEntity q = quizzes.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        List<QuestionView> qv = questions.findByQuizIdOrderByDisplayOrder(quizId)
                .stream()
                .map(e -> new QuestionView(e.getId(), e.getPrompt(), e.getOptions()))
                .toList();
        return new QuizView(q.getId(), q.getTitle(), q.getTopicId(), qv);
    }

    @Override
    @Transactional
    public QuizResult submit(UUID userId, UUID quizId, Map<UUID, String> answers) {
        var qs = questions.findByQuizIdOrderByDisplayOrder(quizId);
        if (qs.isEmpty()) throw new ResourceNotFoundException("Quiz not found");

        Map<UUID, Boolean> per = new HashMap<>();
        int score = 0;
        for (var q : qs) {
            String given = answers.get(q.getId());
            boolean ok = q.getCorrectOption().equalsIgnoreCase(given);
            per.put(q.getId(), ok);
            if (ok) score++;
        }
        events.publishEvent(new QuizSubmittedEvent(userId, quizId, score, qs.size(), Instant.now()));
        return new QuizResult(quizId, score, qs.size(), per);
    }
}
