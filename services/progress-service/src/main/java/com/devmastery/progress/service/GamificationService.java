package com.devmastery.progress.service;

import com.devmastery.progress.config.XpProperties;
import com.devmastery.progress.entity.*;
import com.devmastery.progress.repository.*;
import com.devmastery.progress.dto.StreakUpdatedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final UserStreakRepository streakRepository;
    private final UserXpEventRepository xpEventRepository;
    private final UserBadgeRepository badgeRepository;
    private final SpacedReviewRepository reviewRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final XpProperties xpProperties;

    @Transactional
    public void processTopicCompletion(UUID userId, TopicInfo topic) {
        log.info("Processing topic completion for user {} topic {}", userId, topic.getSlug());

        // 1. Calculate XP based on topic level
        int xpEarned = xpProperties.getLevelMultipliers().getOrDefault(String.valueOf(topic.getLevel()), 10);

        // 2. Update Streak
        UserStreak streak = updateStreak(userId);

        // 3. Update total XP
        streak.setTotalXp(streak.getTotalXp() + xpEarned);
        updateBadgeLevel(streak);
        streakRepository.save(streak);

        // 4. Record XP Event
        UserXpEvent event = UserXpEvent.builder()
                .userId(userId)
                .eventType("topic_complete")
                .xpAmount(xpEarned)
                .referenceId(topic.getId())
                .description("Completed topic: " + topic.getSlug())
                .build();
        xpEventRepository.save(event);

    // 5. Check Badges
        checkAndAwardBadges(userId, streak);
    }

    @Transactional
    public void processLayerCompletion(UUID userId, UUID topicId, String layerName) {
        log.info("Processing layer completion for user {} layer {}", userId, layerName);
        
        int xpEarned = switch (layerName.toLowerCase()) {
            case "feynman" -> 50;
            case "build" -> 100;
            case "spacedreview" -> 20;
            default -> 10;
        };

        UserStreak streak = updateStreak(userId);
        streak.setTotalXp(streak.getTotalXp() + xpEarned);
        updateBadgeLevel(streak);
        streakRepository.save(streak);

        UserXpEvent event = UserXpEvent.builder()
                .userId(userId)
                .eventType("layer_complete_" + layerName)
                .xpAmount(xpEarned)
                .referenceId(topicId)
                .description("Completed layer: " + layerName)
                .build();
        xpEventRepository.save(event);

        checkAndAwardLayerBadges(userId, streak);
    }

    private void checkAndAwardLayerBadges(UUID userId, UserStreak streak) {
        long feynmanCount = xpEventRepository.countByUserIdAndEventType(userId, "layer_complete_feynman");
        if (feynmanCount >= 10) {
            awardBadgeIfNotExists(userId, "the-explainer");
        }

        long buildCount = xpEventRepository.countByUserIdAndEventType(userId, "layer_complete_build");
        if (buildCount >= 5) {
            awardBadgeIfNotExists(userId, "the-builder");
        }

        long reviewCount = xpEventRepository.countByUserIdAndEventType(userId, "layer_complete_spacedreview");
        if (reviewCount >= 20) {
            awardBadgeIfNotExists(userId, "memory-master");
        }
    }

    private UserStreak updateStreak(UUID userId) {
        UserStreak streak = streakRepository.findByUserId(userId)
                .orElseGet(() -> UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .freezeCount(1)
                        .totalXp(0)
                        .badgeLevel("apprentice")
                        .build());

        LocalDate today = LocalDate.now();
        if (streak.getLastActivity() == null) {
            // First activity
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
            streak.setLastActivity(today);
            return streak;
        }

        long daysBetween = ChronoUnit.DAYS.between(streak.getLastActivity(), today);

        if (daysBetween == 0) {
            // Already active today, no streak change
            return streak;
        }

        if (daysBetween == 1) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }
        } else if (daysBetween == 2 && streak.getFreezeCount() > 0) {
            // Missed a day but has freeze
            streak.setFreezeCount(streak.getFreezeCount() - 1);
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }
            log.info("User {} used a streak freeze!", userId);
        } else {
            // Streak broken
            streak.setCurrentStreak(1);
            log.info("User {} streak broken after {} days", userId, daysBetween);
        }

        streak.setLastActivity(today);
        
        // Publish event to Kafka
        StreakUpdatedEvent event = StreakUpdatedEvent.builder()
                .userId(userId)
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .freezeCount(streak.getFreezeCount())
                .build();
        kafkaTemplate.send("user.streak.updated", userId.toString(), event);
        
        return streak;
    }

    private void updateBadgeLevel(UserStreak streak) {
        int xp = streak.getTotalXp();
        if (xp >= 10000) streak.setBadgeLevel("master");
        else if (xp >= 5000) streak.setBadgeLevel("architect");
        else if (xp >= 2000) streak.setBadgeLevel("craftsman");
        else if (xp >= 500) streak.setBadgeLevel("journeyman");
        else streak.setBadgeLevel("apprentice");
    }

    private void checkAndAwardBadges(UUID userId, UserStreak streak) {
        // First topic badge
        awardBadgeIfNotExists(userId, "first-topic");

        // Week streak badge
        if (streak.getCurrentStreak() >= 7) {
            awardBadgeIfNotExists(userId, "week-streak");
        }
        
        // Month streak badge
        if (streak.getCurrentStreak() >= 30) {
            awardBadgeIfNotExists(userId, "month-streak");
        }
    }

    private void awardBadgeIfNotExists(UUID userId, String badgeSlug) {
        if (!badgeRepository.existsByUserIdAndBadgeSlug(userId, badgeSlug)) {
            UserBadge badge = UserBadge.builder()
                    .userId(userId)
                    .badgeSlug(badgeSlug)
                    .build();
            badgeRepository.save(badge);
            
            // Give 50 XP bonus for a badge
            UserStreak streak = streakRepository.findByUserId(userId).orElseThrow();
            streak.setTotalXp(streak.getTotalXp() + 50);
            updateBadgeLevel(streak);
            streakRepository.save(streak);
            
            UserXpEvent event = UserXpEvent.builder()
                    .userId(userId)
                    .eventType("badge_earned")
                    .xpAmount(50)
                    .description("Earned badge: " + badgeSlug)
                    .build();
            xpEventRepository.save(event);
            
            log.info("User {} earned badge {}", userId, badgeSlug);
        }
    }

    public Object getStreakInfo(UUID userId) {
        return streakRepository.findByUserId(userId)
                .orElseGet(() -> UserStreak.builder()
                        .userId(userId)
                        .currentStreak(0)
                        .longestStreak(0)
                        .freezeCount(1)
                        .totalXp(0)
                        .badgeLevel("apprentice")
                        .build());
    }

    public Object getUserSummary(UUID userId) {
        UserStreak streak = (UserStreak) getStreakInfo(userId);
        var badges = badgeRepository.findByUserId(userId);
        
        return Map.of(
            "streak", streak,
            "badges", badges
        );
    }
}
