package com.devmastery.progress.repository;

import com.devmastery.progress.entity.TopicInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TopicInfoRepository extends JpaRepository<TopicInfo, UUID> {
    Optional<TopicInfo> findBySlug(String slug);
}
