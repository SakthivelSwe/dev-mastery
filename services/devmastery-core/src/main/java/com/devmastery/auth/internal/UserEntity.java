package com.devmastery.auth.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class UserEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "auth_provider")
    private String authProvider; // "local", "google" etc.

    @Column(nullable = false)
    private String role; // USER | ADMIN

    @Column(nullable = false)
    private String subscription; // free | premium

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (role == null) role = "USER";
        if (subscription == null) subscription = "free";
        if (authProvider == null) authProvider = "local";
    }
}
