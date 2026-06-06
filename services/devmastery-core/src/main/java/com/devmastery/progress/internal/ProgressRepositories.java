package com.devmastery.progress.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface UserXpEventRepository extends JpaRepository<UserXpEventEntity, UUID> {
    @org.springframework.data.jpa.repository.Query("select coalesce(sum(e.xpAmount),0) from UserXpEventEntity e where e.userId = ?1")
    long sumXpByUser(UUID userId);
}

interface UserStreakRepository extends JpaRepository<UserStreakEntity, UUID> {
    Optional<UserStreakEntity> findByUserId(UUID userId);
}

interface UserBadgeRepository extends JpaRepository<UserBadgeEntity, UUID> {
    long countByUserId(UUID userId);
}

interface SpacedReviewRepository extends JpaRepository<SpacedReviewEntity, UUID> {
    Optional<SpacedReviewEntity> findByUserIdAndTopicId(UUID userId, UUID topicId);
    List<SpacedReviewEntity> findByUserIdAndNextReviewDateLessThanEqual(UUID userId, LocalDate date);
}
