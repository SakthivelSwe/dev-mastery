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

    /** Legacy column — does not exist in the Supabase {@code code_examples} table.
     *  Kept on the entity for back-compat with {@code ContentService} mappers. */
    @Transient
    private String expectedOutput;
}
