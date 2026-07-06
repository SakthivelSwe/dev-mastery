package com.devmastery.quiz.web;

import com.devmastery.quiz.api.QuizService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/quizzes")
public class QuizController {

    private final QuizService quiz;
    public QuizController(QuizService quiz) { this.quiz = quiz; }

    @GetMapping("/{quizId}")
    public QuizService.QuizView get(@PathVariable UUID quizId) { return quiz.getQuiz(quizId); }

    @PostMapping("/{quizId}/submit")
    public QuizService.QuizResult submit(@AuthenticationPrincipal UUID userId,
                                         @PathVariable UUID quizId,
                                         @RequestBody Map<UUID, String> answers) {
        return quiz.submit(userId, quizId, answers);
    }

    /** GET /v1/quizzes/difficulty/{topicSlug} — returns current adaptive level (1–4) */
    @GetMapping("/difficulty/{topicSlug}")
    public Map<String, Integer> difficulty(@AuthenticationPrincipal UUID userId,
                                            @PathVariable String topicSlug) {
        return Map.of("level", quiz.getDifficultyLevel(userId, topicSlug));
    }
}
