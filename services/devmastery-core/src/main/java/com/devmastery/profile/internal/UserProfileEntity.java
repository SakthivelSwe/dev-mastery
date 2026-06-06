package com.devmastery.profile.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserProfileEntity {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    private String timezone;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist @PreUpdate
    void onSave() { updatedAt = Instant.now(); }
}
