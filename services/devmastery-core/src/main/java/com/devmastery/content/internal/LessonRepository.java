package com.devmastery.content.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface LessonRepository extends JpaRepository<LessonEntity, UUID> {
    List<LessonEntity> findByTopicIdOrderBySection(UUID topicId);
    Optional<LessonEntity> findById(UUID id);
    Optional<LessonEntity> findByTopicIdAndSection(UUID topicId, String section);
}
