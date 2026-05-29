package com.devmastery.ai.repository;

import com.devmastery.ai.entity.InterviewSession;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface InterviewSessionRepository extends ReactiveCrudRepository<InterviewSession, UUID> {
    Flux<InterviewSession> findByUserId(UUID userId);
}
