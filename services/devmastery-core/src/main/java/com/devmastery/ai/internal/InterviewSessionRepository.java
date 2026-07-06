package com.devmastery.ai.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface InterviewSessionRepository extends JpaRepository<InterviewSessionEntity, UUID> {
    List<InterviewSessionEntity> findByUserIdOrderByStartedAtDesc(UUID userId);
}

