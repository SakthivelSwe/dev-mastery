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

    @Column(nullable = false)
    private String section;

    @Column(columnDefinition = "text")
    private String content;
}
