package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "learning_paths")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class LearningPathEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    private String icon;

    @Column(name = "accent_color")
    private String accentColor;

    @Column(name = "display_order")
    private int displayOrder;
}
