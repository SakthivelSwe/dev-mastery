package com.devmastery.progress.service;

import com.devmastery.progress.dto.ReviewRatingRequest;
import com.devmastery.progress.entity.SpacedReviewSchedule;
import com.devmastery.progress.repository.SpacedReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpacedReviewService {

    private final SpacedReviewRepository reviewRepository;

    @Transactional
    public void initializeReview(UUID userId, UUID topicId, String topicSlug) {
        if (reviewRepository.findByUserIdAndTopicId(userId, topicId).isEmpty()) {
            SpacedReviewSchedule schedule = SpacedReviewSchedule.builder()
                    .userId(userId)
                    .topicId(topicId)
                    .topicSlug(topicSlug)
                    .nextReviewDate(Instant.now().plus(1, ChronoUnit.DAYS))
                    .build();
            reviewRepository.save(schedule);
            log.info("Initialized spaced review for user {} and topic {}", userId, topicId);
        }
    }

    @Transactional
    public void processReview(UUID userId, UUID topicId, ReviewRatingRequest request) {
        SpacedReviewSchedule schedule = reviewRepository.findByUserIdAndTopicId(userId, topicId)
                .orElseThrow(() -> new IllegalArgumentException("No review schedule found for this topic"));

        int quality = mapRatingToQuality(request.rating());

        // SuperMemo-2 Algorithm
        if (quality < 3) {
            schedule.setRepetitions(0);
            schedule.setIntervalDays(1);
        } else {
            schedule.setRepetitions(schedule.getRepetitions() + 1);
            if (schedule.getRepetitions() == 1) {
                schedule.setIntervalDays(1);
            } else if (schedule.getRepetitions() == 2) {
                schedule.setIntervalDays(6);
            } else {
                schedule.setIntervalDays(Math.round(schedule.getIntervalDays() * schedule.getEasinessFactor()));
            }
        }

        float newEf = schedule.getEasinessFactor() + (0.1f - (5 - quality) * (0.08f + (5 - quality) * 0.02f));
        schedule.setEasinessFactor(Math.max(1.3f, newEf));
        schedule.setNextReviewDate(Instant.now().plus(schedule.getIntervalDays(), ChronoUnit.DAYS));

        reviewRepository.save(schedule);
        log.info("Processed review for topic {}: EF={}, Interval={}, NextReview={}", 
                topicId, schedule.getEasinessFactor(), schedule.getIntervalDays(), schedule.getNextReviewDate());
    }

    public List<SpacedReviewSchedule> getDueReviews(UUID userId) {
        return reviewRepository.findDueReviews(userId, Instant.now());
    }

    private int mapRatingToQuality(String rating) {
        if (rating == null) return 0;
        return switch (rating.toLowerCase()) {
            case "easy" -> 5;
            case "good" -> 4;
            case "hard" -> 3;
            default -> 0; // complete failure to recall
        };
    }
}
