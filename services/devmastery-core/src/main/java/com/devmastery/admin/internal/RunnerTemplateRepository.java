package com.devmastery.admin.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface RunnerTemplateRepository extends JpaRepository<RunnerTemplateEntity, UUID> {
    Optional<RunnerTemplateEntity> findByLanguage(String language);
}
