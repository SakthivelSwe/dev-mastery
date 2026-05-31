package com.devmastery.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Topic entity — a single learning concept (e.g., "HashMap Internal Working").
 * Belongs to a LearningPath. Contains 6 Lessons (one per teaching layer).
 * Matches the topics table (V2 migration).
 */
@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"learningPath", "lessons", "codeExamples"})
@EqualsAndHashCode(of = "id")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "path_id", nullable = false)
    @JsonIgnore
    private LearningPath learningPath;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "estimated_mins", nullable = false)
    private Integer estimatedMins;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "has_visualizer", nullable = false)
    private Boolean hasVisualizer = false;

    @Column(name = "has_code_lab", nullable = false)
    private Boolean hasCodeLab = false;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Column(columnDefinition = "TEXT[]")
    @org.hibernate.annotations.Array(length = 20)
    private String[] tags = new String[0];

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @JsonDeserialize(as = ArrayList.class)
    private List<Lesson> lessons = new ArrayList<>();

    @OneToMany(mappedBy = "topic", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @JsonDeserialize(as = ArrayList.class)
    private List<CodeExample> codeExamples = new ArrayList<>();
}
