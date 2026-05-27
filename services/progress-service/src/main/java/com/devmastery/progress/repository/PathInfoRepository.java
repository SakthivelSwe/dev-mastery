package com.devmastery.progress.repository;

import com.devmastery.progress.entity.PathInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PathInfoRepository extends JpaRepository<PathInfo, UUID> {
    Optional<PathInfo> findBySlug(String slug);
}
