package com.devmastery.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Lesson entity — one of 6 teaching sections within a Topic.
 * section_type: why | theory | visual | code | realworld | interview
 * content_mdx: full MDX content rendered by Next.js via @next/mdx
 */
@Entity
@Table(name = "lessons",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_lesson_topic_section",
           columnNames = {"topic_id", "section_type"}
       ))
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "topic")
@EqualsAndHashCode(of = "id")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "section_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SectionType sectionType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "content_mdx", nullable = false, columnDefinition = "TEXT")
    private String contentMdx = "";

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "estimated_mins", nullable = false)
    private Integer estimatedMins = 5;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * The 6 teaching layers per the DevMastery spec.
     * Stored as VARCHAR in DB (EnumType.STRING).
     */
    public enum SectionType {
        why,
        theory,
        visual,
        code,
        realworld,
        interview
    }
}
