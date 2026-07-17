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

    /**
     * The Supabase schema column is {@code name} (not {@code full_name}).
     * We keep the Java field {@code fullName} so the API response shape
     * ({@code AuthService.UserView.fullName}) stays stable.
     */
    @Column(name = "name", nullable = false)
    private String fullName;

    @Column(name = "auth_provider", nullable = false)
    private String authProvider; // CHECK: 'google' | 'github' | 'email'

    @Column(nullable = false)
    private String role; // CHECK: 'user' | 'admin'

    @Column(nullable = false)
    private String subscription; // CHECK: 'free' | 'pro'

    /** LeetCode username for auto-sync of solved problems */
    @Column(name = "leetcode_username")
    private String leetcodeUsername;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (role == null) role = "user";
        if (subscription == null) subscription = "free";
        if (authProvider == null) authProvider = "email";
    }
}
