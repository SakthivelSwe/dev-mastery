package com.devmastery.content.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "problem_patterns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemPattern {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String name;
    
    @Column(unique = true)
    private String slug;
    
    private String description;
    
    @Column(name = "difficulty_level")
    private String difficultyLevel;

    @OneToMany(mappedBy = "pattern", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PatternProblem> problems;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
