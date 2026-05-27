package com.devmastery.progress.repository;

import com.devmastery.progress.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserId(UUID userId);
    Optional<UserBadge> findByUserIdAndBadgeSlug(UUID userId, String badgeSlug);
    boolean existsByUserIdAndBadgeSlug(UUID userId, String badgeSlug);
}
