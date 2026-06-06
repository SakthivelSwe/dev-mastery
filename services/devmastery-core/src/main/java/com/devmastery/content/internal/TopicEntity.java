package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.UUID;

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

    @Column(name = "display_order")
    private int displayOrder;

    @Column(nullable = false)
    private String status; // draft | published

    @Column(name = "xp_reward")
    private int xpReward;

    @Column(name = "estimated_mins")
    private int estimatedMins;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;

    // Six learning layers — stored inline for simplicity.
    @Column(columnDefinition = "text") private String why;
    @Column(columnDefinition = "text") private String theory;
    @Column(columnDefinition = "text") private String visual;
    @Column(columnDefinition = "text") private String code;
    @Column(name = "real_world", columnDefinition = "text") private String realWorld;
    @Column(columnDefinition = "text") private String interview;
    @Column(columnDefinition = "text") private String feynman;
    @Column(columnDefinition = "text") private String build;
    @Column(name = "spaced_review", columnDefinition = "text") private String spacedReview;
}
