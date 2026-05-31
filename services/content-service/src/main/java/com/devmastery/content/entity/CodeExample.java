package com.devmastery.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * CodeExample entity — runnable code snippets for a topic lesson.
 *
 * Supports two access patterns:
 *  1. Legacy FK-based: via topic (ManyToOne) + lesson + level (1–5)
 *  2. Slug-based (new): via topicSlug + difficultyTier + language
 *     Used by the Code Lab tier/language switcher.
 *
 * Executed via Judge0 CE self-hosted (is_runnable = true).
 */
@Entity
@Table(
    name = "code_examples",
    indexes = {
        @Index(name = "idx_code_examples_topic_slug",     columnList = "topic_slug"),
        @Index(name = "idx_code_examples_slug_tier",      columnList = "topic_slug, difficulty_tier"),
        @Index(name = "idx_code_examples_slug_tier_lang", columnList = "topic_slug, difficulty_tier, language"),
    }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"topic", "lesson"})
@EqualsAndHashCode(of = "id")
public class CodeExample {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    // ─── Legacy FK-based fields ───────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    @JsonIgnore
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonIgnore
    private Lesson lesson;

    @Column(length = 50)
    private String language = "java";

    @Column
    private Integer level;   // 1=Beginner, 3=Intermediate, 5=Expert (legacy)

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "time_complexity", length = 50)
    private String timeComplexity;

    @Column(name = "space_complexity", length = 50)
    private String spaceComplexity;

    @Column(name = "is_runnable", nullable = false)
    private Boolean isRunnable = true;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    // ─── New slug-based fields (Code Lab tier/language switcher) ──────────────

    /**
     * Direct slug reference — e.g. "array-basics".
     * Allows O(1) lookup without joining to the topics table.
     */
    @Column(name = "topic_slug", length = 100)
    private String topicSlug;

    /**
     * Difficulty tier: easy | intermediate | expert | advanced.
     * Replaces the numeric 'level' field for the new tier-aware Code Lab.
     */
    @Column(name = "difficulty_tier", length = 20)
    private String difficultyTier;

    /**
     * JSONB column storing algorithm tricks and insights.
     * Schema: { memoryTrick, commonMistake: {wrong, correct, explanation},
     *           patternName, syntaxQuickRef: [], whyItWorks }
     * Serialized as raw JSON string; parsed to CodeExampleTricks in the service.
     */
    @Column(name = "tricks_json", columnDefinition = "jsonb")
    private String tricksJson;

    /** Algorithmic pattern name (e.g. "Two Pointer", "Sliding Window"). */
    @Column(name = "pattern_name", length = 100)
    private String patternName;

    /** Only published examples are returned to users via the API. */
    @Column(name = "is_published", nullable = false)
    private boolean isPublished = false;

    // ─── Timestamps ────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }
}
