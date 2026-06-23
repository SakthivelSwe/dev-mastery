package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class LessonEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "topic_id", nullable = false, columnDefinition = "uuid")
    private UUID topicId;

    /** Supabase column is {@code section_type} (CHECK why|theory|...|spacedreview). */
    @Column(name = "section_type", nullable = false)
    private String section;

    /** Supabase column is {@code content_mdx}. */
    @Column(name = "content_mdx", columnDefinition = "text")
    private String content;
}
