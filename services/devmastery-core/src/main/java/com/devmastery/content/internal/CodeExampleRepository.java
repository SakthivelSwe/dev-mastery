package com.devmastery.content.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface CodeExampleRepository extends JpaRepository<CodeExampleEntity, UUID> {
    List<CodeExampleEntity> findByTopicId(UUID topicId);
}
