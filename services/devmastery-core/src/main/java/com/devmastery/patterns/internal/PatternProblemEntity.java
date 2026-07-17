package com.devmastery.patterns.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pattern_problems")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class PatternProblemEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "pattern_id", nullable = false, columnDefinition = "uuid")
    private UUID patternId;

    @Column(nullable = false)
    private String title;

    private String difficulty;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "starter_code", columnDefinition = "text")
    private String starterCode;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "xp_value")
    private Integer xpValue;

    @Column(name = "created_at")
    private Instant createdAt;
}

