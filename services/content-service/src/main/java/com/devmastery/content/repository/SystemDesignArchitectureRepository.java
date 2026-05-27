package com.devmastery.content.repository;

import com.devmastery.content.model.SystemDesignArchitecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemDesignArchitectureRepository extends JpaRepository<SystemDesignArchitecture, UUID> {
    Optional<SystemDesignArchitecture> findBySlug(String slug);
}
