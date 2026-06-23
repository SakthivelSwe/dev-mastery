package com.devmastery.patterns.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "problem_patterns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class ProblemPatternEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "difficulty_level")
    private String difficultyLevel;

    @Column(name = "created_at")
    private Instant createdAt;
}

