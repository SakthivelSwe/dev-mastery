package com.devmastery.progress.service;

import com.devmastery.progress.dto.MarkCompleteRequest;
import com.devmastery.progress.entity.LessonCompletion;
import com.devmastery.progress.entity.UserProgress;
import com.devmastery.progress.entity.TopicInfo;
import com.devmastery.progress.entity.PathInfo;
import com.devmastery.progress.repository.LessonCompletionRepository;
import com.devmastery.progress.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final LessonCompletionRepository lessonCompletionRepository;
    private final UserProgressRepository userProgressRepository;
    private final com.devmastery.progress.repository.TopicInfoRepository topicInfoRepository;
    private final com.devmastery.progress.repository.PathInfoRepository pathInfoRepository;
    private final GamificationService gamificationService;

    @Transactional
    public void markLessonComplete(UUID userId, MarkCompleteRequest request) {
        // Idempotency check for lesson completion
        if (lessonCompletionRepository.findByUserIdAndLessonId(userId, request.lessonId()).isEmpty()) {
            LessonCompletion completion = new LessonCompletion();
            completion.setUserId(userId);
            completion.setLessonId(request.lessonId());
            completion.setTimeSpentSecs(request.timeSpentSecs() != null ? request.timeSpentSecs() : 0);
            lessonCompletionRepository.save(completion);
        }

        // Update Topic Progress
        UserProgress progress = userProgressRepository.findByUserIdAndTopicId(userId, request.topicId())
                .orElseGet(() -> {
                    UserProgress newProgress = new UserProgress();
                    newProgress.setUserId(userId);
                    newProgress.setTopicId(request.topicId());
                    newProgress.setStatus("in_progress");
                    newProgress.setStartedAt(OffsetDateTime.now());
                    return newProgress;
                });

        // Simplified logic: Just bumping completion pct for now.
        // In real system, we'd query all lessons for this topic and calculate exactly.
        if (progress.getCompletionPct() < 100) {
            progress.setCompletionPct(Math.min(100, progress.getCompletionPct() + 20));
        }

        if (progress.getCompletionPct() == 100 && !"completed".equals(progress.getStatus())) {
            progress.setStatus("completed");
            progress.setCompletedAt(OffsetDateTime.now());
            progress.setXpEarned(100);
        }

        userProgressRepository.save(progress);
    }
    
    public Object getUserProgress(UUID userId) {
        return userProgressRepository.findByUserId(userId);
    }

    public void startTopic(UUID userId, String slug) {
        TopicInfo topic = topicInfoRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        UserProgress progress = userProgressRepository.findByUserIdAndTopicId(userId, topic.getId())
                .orElseGet(() -> {
                    UserProgress newProgress = new UserProgress();
                    newProgress.setUserId(userId);
                    newProgress.setTopicId(topic.getId());
                    return newProgress;
                });

        if ("not_started".equals(progress.getStatus())) {
            progress.setStatus("in_progress");
            progress.setStartedAt(OffsetDateTime.now());
            userProgressRepository.save(progress);
        }
    }

    @Transactional
    public void completeTopic(UUID userId, String slug) {
        TopicInfo topic = topicInfoRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        UserProgress progress = userProgressRepository.findByUserIdAndTopicId(userId, topic.getId())
                .orElseGet(() -> {
                    UserProgress newProgress = new UserProgress();
                    newProgress.setUserId(userId);
                    newProgress.setTopicId(topic.getId());
                    newProgress.setStartedAt(OffsetDateTime.now());
                    return newProgress;
                });

        if (!"completed".equals(progress.getStatus())) {
            progress.setStatus("completed");
            progress.setCompletedAt(OffsetDateTime.now());
            progress.setCompletionPct(100);
            
            // Gamification integration
            gamificationService.processTopicCompletion(userId, topic);
            
            userProgressRepository.save(progress);
        }
    }

    public Object getUserStreak(UUID userId) {
        return gamificationService.getStreakInfo(userId);
    }
    
    public Object getUserSummary(UUID userId) {
        return gamificationService.getUserSummary(userId);
    }
    
    public Map<String, Boolean> getPathProgress(UUID userId, String pathSlug) {
        PathInfo path = pathInfoRepository.findBySlug(pathSlug)
                .orElseThrow(() -> new RuntimeException("Path not found"));
                
        // In a real optimized system, we'd query topics directly joined with user progress.
        // For now, fetch all progress for the user.
        return userProgressRepository.findByUserId(userId).stream()
                .filter(p -> "completed".equals(p.getStatus()))
                .filter(p -> topicInfoRepository.findById(p.getTopicId())
                        .map(TopicInfo::getPathId)
                        .filter(id -> id.equals(path.getId()))
                        .isPresent())
                .collect(Collectors.toMap(
                        p -> topicInfoRepository.findById(p.getTopicId()).get().getSlug(),
                        p -> true,
                        (existing, replacement) -> existing
                ));
    }
}
