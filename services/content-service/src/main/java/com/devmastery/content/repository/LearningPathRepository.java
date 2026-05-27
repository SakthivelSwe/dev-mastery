package com.devmastery.content.repository;

import com.devmastery.content.entity.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPath, UUID> {

    Optional<LearningPath> findBySlug(String slug);

    List<LearningPath> findByIsActiveTrueOrderByOrderIndexAsc();

    @Query("SELECT lp FROM LearningPath lp WHERE lp.isActive = true ORDER BY lp.orderIndex ASC")
    List<LearningPath> findAllActive();

    boolean existsBySlug(String slug);
}
