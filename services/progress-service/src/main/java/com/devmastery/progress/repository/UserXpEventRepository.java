package com.devmastery.progress.repository;

import com.devmastery.progress.entity.UserXpEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserXpEventRepository extends JpaRepository<UserXpEvent, UUID> {
    List<UserXpEvent> findByUserIdOrderByEarnedAtDesc(UUID userId);
    long countByUserIdAndEventType(UUID userId, String eventType);
}
