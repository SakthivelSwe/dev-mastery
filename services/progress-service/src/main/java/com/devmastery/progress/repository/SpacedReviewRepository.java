package com.devmastery.progress.repository;

import com.devmastery.progress.entity.SpacedReviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpacedReviewRepository extends JpaRepository<SpacedReviewSchedule, UUID> {
    Optional<SpacedReviewSchedule> findByUserIdAndTopicId(UUID userId, UUID topicId);

    @Query("SELECT s FROM SpacedReviewSchedule s WHERE s.userId = :userId AND s.nextReviewDate <= :now ORDER BY s.nextReviewDate ASC")
    List<SpacedReviewSchedule> findDueReviews(UUID userId, Instant now);
}
