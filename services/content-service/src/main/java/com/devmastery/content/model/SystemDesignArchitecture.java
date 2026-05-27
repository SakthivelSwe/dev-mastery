package com.devmastery.content.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_design_architectures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemDesignArchitecture {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String title;
    
    @Column(unique = true)
    private String slug;
    
    private String description;
    
    private String difficulty;
    
    @Column(name = "mermaid_diagram", columnDefinition = "TEXT")
    private String mermaidDiagram;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
