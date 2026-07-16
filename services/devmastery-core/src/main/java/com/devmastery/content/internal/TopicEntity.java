package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Topic entity — mapped against the Supabase {@code topics} schema (V≥5).
 *
 * The original design stored the six "learning layers" (why/theory/visual/...)
 * directly on the topic. The current schema moves them into the {@code lessons}
 * table, so those Java fields are kept as {@link Transient} for backwards
 * compatibility with existing service code (they remain {@code null}).
 */
@Entity
@Table(name = "topics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class TopicEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(name = "path_id", columnDefinition = "uuid")
    private UUID pathId;

    @Column(nullable = false)
    private int level;

    /** Supabase column is {@code order_index}. */
    @Column(name = "order_index")
    private int displayOrder;

    /** Supabase uses a boolean {@code is_published}; we expose it as a string. */
    @Column(name = "is_published", nullable = false)
    private boolean published;

    @Column(name = "estimated_mins")
    private int estimatedMins;

    @Column(name = "has_visualizer")
    private boolean hasVisualizer;

    @Column(name = "has_code_lab")
    private boolean hasCodeLab;

    // ── Fields not present in the V≥5 schema — kept transient so existing code
    //    that touches them still compiles and returns sensible defaults. ─────
    @Builder.Default @Transient private int xpReward = 50;
    @Transient private List<String> tags;
    @Transient private String status;
    @Transient private String why;
    @Transient private String theory;
    @Transient private String visual;
    @Transient private String code;
    @Transient private String realWorld;
    @Transient private String interview;
    @Transient private String feynman;
    @Transient private String build;
    @Transient private String spacedReview;
}
