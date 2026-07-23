package com.devmastery.progress.internal;

import com.devmastery.common.events.LessonCompletedEvent;
import com.devmastery.common.events.QuizSubmittedEvent;
import com.devmastery.common.events.TopicCompletedEvent;
import com.devmastery.common.exception.BadRequestException;
import com.devmastery.config.CacheNames;
import com.devmastery.progress.api.ProgressService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Single service handling progress + gamification + spaced repetition.
 *
 * <p>Async {@code @EventListener} methods replace the previous Kafka
 * producers/consumers: events are published in-process by
 * {@code ContentServiceImpl} and {@code QuizService} and consumed here.</p>
 */
@Service
class ProgressServiceImpl implements ProgressService {

    private static final int LESSON_XP = 10;
    private static final int TOPIC_XP  = 50;
    private static final int QUIZ_XP   = 25;

    private final UserXpEventRepository xp;
    private final UserStreakRepository streaks;
    private final UserBadgeRepository badges;
    private final SpacedReviewRepository reviews;

    ProgressServiceImpl(UserXpEventRepository xp, UserStreakRepository streaks,
                        UserBadgeRepository badges, SpacedReviewRepository reviews) {
        this.xp = xp; this.streaks = streaks; this.badges = badges; this.reviews = reviews;
    }

    // ─── Query side ────────────────────────────────────────

    @Override
    @Cacheable(value = CacheNames.USER_PROGRESS, key = "#userId")
    public ProgressSummary summary(UUID userId) {
        long totalXp = xp.sumXpByUser(userId);
        var s = streaks.findByUserId(userId).orElse(
                UserStreakEntity.builder().userId(userId).currentStreak(0).longestStreak(0).build());
        return new ProgressSummary(userId, totalXp, s.getCurrentStreak(), s.getLongestStreak(),
                (int) xp.findAll().stream().filter(e -> e.getUserId().equals(userId)
                        && "topic_completed".equals(e.getEventType())).count(),
                (int) badges.countByUserId(userId),
                s.getFreezeCount());
    }

    @Override
    public List<ReviewItem> dueReviews(UUID userId) {
        return reviews.findByUserIdAndNextReviewDateLessThanEqual(userId, LocalDate.now())
                .stream().map(r -> new ReviewItem(r.getTopicId(), null,
                        r.getNextReviewDate(), r.getRepetitions(), r.getEaseFactor()))
                .toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheNames.USER_PROGRESS, key = "#userId")
    public void submitReview(UUID userId, UUID topicId, int rating) {
        if (rating < 1 || rating > 5) throw new BadRequestException("rating must be 1-5");
        var entity = reviews.findByUserIdAndTopicId(userId, topicId).orElseGet(() ->
                SpacedReviewEntity.builder().userId(userId).topicId(topicId)
                        .easeFactor(2.5).intervalDays(1).repetitions(0)
                        .nextReviewDate(LocalDate.now()).build());

        applySm2(entity, rating);
        reviews.save(entity);
    }

    // SM-2 algorithm.
    private void applySm2(SpacedReviewEntity e, int quality) {
        if (quality < 3) {
            e.setRepetitions(0);
            e.setIntervalDays(1);
        } else {
            e.setRepetitions(e.getRepetitions() + 1);
            e.setIntervalDays(switch (e.getRepetitions()) {
                case 1 -> 1;
                case 2 -> 6;
                default -> (int) Math.round(e.getIntervalDays() * e.getEaseFactor());
            });
        }
        double newEase = e.getEaseFactor() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        e.setEaseFactor(Math.max(1.3, newEase));
        e.setNextReviewDate(LocalDate.now().plusDays(e.getIntervalDays()));
    }

    // ─── Event listeners (replace Kafka consumers) ─────────

    @Async
    @EventListener
    @Transactional
    @CacheEvict(value = CacheNames.USER_PROGRESS, key = "#event.userId()")
    public void onLessonCompleted(LessonCompletedEvent event) {
        awardXp(event.userId(), event.topicId(), LESSON_XP, "lesson_completed");
        bumpStreak(event.userId());
    }

    @Async
    @EventListener
    @Transactional
    @CacheEvict(value = CacheNames.USER_PROGRESS, key = "#event.userId()")
    public void onTopicCompleted(TopicCompletedEvent event) {
        awardXp(event.userId(), event.topicId(), TOPIC_XP, "topic_completed");
        bumpStreak(event.userId());
        scheduleInitialReview(event.userId(), event.topicId(), event.topicSlug());
    }

    @Async
    @EventListener
    @Transactional
    @CacheEvict(value = CacheNames.USER_PROGRESS, key = "#event.userId()")
    public void onQuizSubmitted(QuizSubmittedEvent event) {
        int award = (int) Math.round(QUIZ_XP * ((double) event.score() / Math.max(1, event.maxScore())));
        if (award > 0) awardXp(event.userId(), null, award, "quiz_completed");
    }

    private void awardXp(UUID userId, UUID topicId, int amount, String type) {
        xp.save(UserXpEventEntity.builder()
                .userId(userId).topicId(topicId).xpAmount(amount).eventType(type).build());
    }

    private void bumpStreak(UUID userId) {
        var s = streaks.findByUserId(userId).orElseGet(() ->
                UserStreakEntity.builder().userId(userId).currentStreak(0).longestStreak(0).build());
        LocalDate today = LocalDate.now();
        if (today.equals(s.getLastActivityDate())) return;
        if (s.getLastActivityDate() != null && today.minusDays(1).equals(s.getLastActivityDate())) {
            s.setCurrentStreak(s.getCurrentStreak() + 1);
        } else {
            s.setCurrentStreak(1);
        }
        s.setLongestStreak(Math.max(s.getLongestStreak(), s.getCurrentStreak()));
        s.setLastActivityDate(today);
        streaks.save(s);
    }

    private void scheduleInitialReview(UUID userId, UUID topicId, String topicSlug) {
        if (reviews.findByUserIdAndTopicId(userId, topicId).isPresent()) return;
        reviews.save(SpacedReviewEntity.builder()
                .userId(userId).topicId(topicId).topicSlug(topicSlug)
                .easeFactor(2.5).intervalDays(1).repetitions(0)
                .nextReviewDate(LocalDate.now().plusDays(1)).build());
    }
}
