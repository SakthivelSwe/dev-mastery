package com.devmastery.content.internal;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "code_examples")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class CodeExampleEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "topic_id", nullable = false, columnDefinition = "uuid")
    private UUID topicId;

    @Column(nullable = false)
    private String language;

    @Column(columnDefinition = "text")
    private String code;

    @Column(columnDefinition = "text")
    private String explanation;

    @Column(name = "expected_output", columnDefinition = "text")
    private String expectedOutput;
}
