package com.devmastery.progress.repository;

import com.devmastery.progress.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface UserProgressRepository extends JpaRepository<UserProgress, UUID> {
    Optional<UserProgress> findByUserIdAndTopicId(UUID userId, UUID topicId);
    List<UserProgress> findByUserId(UUID userId);
    long countByUserIdAndStatus(UUID userId, String status);
}
