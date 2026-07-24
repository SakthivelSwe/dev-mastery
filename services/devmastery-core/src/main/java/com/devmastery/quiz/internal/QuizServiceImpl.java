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
    private final QuizDifficultyRepository difficulties;
    private final ApplicationEventPublisher events;

    QuizServiceImpl(QuizRepository quizzes, QuizQuestionRepository questions,
                    QuizDifficultyRepository difficulties,
                    ApplicationEventPublisher events) {
        this.quizzes = quizzes; this.questions = questions;
        this.difficulties = difficulties; this.events = events;
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
        QuizEntity quiz = quizzes.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        var qs = questions.findByQuizIdOrderByDisplayOrder(quizId);
        if (qs.isEmpty()) throw new ResourceNotFoundException("Quiz has no questions");

        Map<UUID, Boolean> per = new HashMap<>();
        int score = 0;
        for (var q : qs) {
            String given = answers.get(q.getId());
            boolean ok = q.getCorrectOption().equalsIgnoreCase(given);
            per.put(q.getId(), ok);
            if (ok) score++;
        }

        // Update adaptive difficulty for this user + topic
        String topicSlug = resolveTopicSlug(quiz.getTopicId());
        int newLevel = updateDifficulty(userId, topicSlug, score, qs.size());

        events.publishEvent(new QuizSubmittedEvent(userId, quizId, score, qs.size(), Instant.now()));
        return new QuizResult(quizId, score, qs.size(), per, newLevel);
    }

    @Override
    public int getDifficultyLevel(UUID userId, String topicSlug) {
        return difficulties.findByIdUserIdAndIdTopicSlug(userId, topicSlug)
                .map(QuizDifficultyEntity::getCurrentLevel)
                .orElse(2);  // default: Intermediate
    }

    @org.springframework.scheduling.annotation.Async
    @org.springframework.context.event.EventListener
    @Transactional
    public void onUserDeleted(com.devmastery.common.events.UserDeletedEvent event) {
        difficulties.deleteByIdUserId(event.userId());
    }

    // ── helpers ──────────────────────────────────────────────────

    private int updateDifficulty(UUID userId, String topicSlug, int scored, int outOf) {
        QuizDifficultyEntity diff = difficulties
                .findByIdUserIdAndIdTopicSlug(userId, topicSlug)
                .orElseGet(() -> QuizDifficultyEntity.initial(userId, topicSlug));
        diff.recordResult(scored, outOf);
        difficulties.save(diff);
        return diff.getCurrentLevel();
    }

    private String resolveTopicSlug(UUID topicId) {
        // Null-safe: if topic not found, return a default slug for difficulty tracking
        if (topicId == null) return "unknown";
        try {
            return quizzes.findTopicSlugByTopicId(topicId);
        } catch (Exception e) {
            return topicId.toString();
        }
    }
}
