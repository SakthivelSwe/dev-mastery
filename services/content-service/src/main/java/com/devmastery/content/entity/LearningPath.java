package com.devmastery.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

/**
 * Learning Path entity.
 * Top-level grouping: Java Mastery, DSA Mastery, Spring Boot Mastery, etc.
 * Matches the learning_paths table (V1 migration).
 */
@Entity
@Table(name = "learning_paths")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "topics")
@EqualsAndHashCode(of = "id")
public class LearningPath {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String icon;

    @Column(name = "accent_color", length = 20)
    private String accentColor;

    @Column(name = "level_min", nullable = false)
    private Integer levelMin;

    @Column(name = "level_max", nullable = false)
    private Integer levelMax;

    @Column(name = "total_topics", nullable = false)
    private Integer totalTopics = 0;

    @Column(name = "estimated_hours", nullable = false)
    private Integer estimatedHours = 0;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "learningPath", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("orderIndex ASC")
    @JsonDeserialize(as = ArrayList.class)
    private List<Topic> topics = new ArrayList<>();
}
