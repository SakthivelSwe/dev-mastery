package com.devmastery.admin.internal;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "runner_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class RunnerTemplateEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid") private UUID id;
    @Column(nullable = false, unique = true) private String language;
    @Column(nullable = false) private String name;
    @Column(name = "url_template", nullable = false) private String urlTemplate;
    @Column(nullable = false) private boolean active;
}
