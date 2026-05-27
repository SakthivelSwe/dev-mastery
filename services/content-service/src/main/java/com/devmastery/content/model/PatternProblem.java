package com.devmastery.content.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pattern_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatternProblem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "pattern_id", nullable = false)
    @JsonIgnore
    private ProblemPattern pattern;

    private String title;
    
    private String difficulty;
    
    @Column(name = "leetcode_url")
    private String leetcodeUrl;
    
    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
