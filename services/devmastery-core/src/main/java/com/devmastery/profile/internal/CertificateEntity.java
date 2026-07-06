package com.devmastery.profile.internal;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "certificates")
class CertificateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "credential_id", nullable = false, unique = true)
    private UUID credentialId = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "path_slug", nullable = false)
    private String pathSlug;

    @Column(name = "path_title", nullable = false)
    private String pathTitle;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt = Instant.now();

    @Column(name = "total_topics", nullable = false)
    private int totalTopics;

    @Column(name = "avg_quiz_score")
    private Double avgQuizScore;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @Column(name = "revoked_reason")
    private String revokedReason;

    // ── getters / setters ─────────────────────────────────────────

    UUID getId()                         { return id; }
    UUID getCredentialId()               { return credentialId; }
    UUID getUserId()                     { return userId; }
    String getPathSlug()                 { return pathSlug; }
    String getPathTitle()                { return pathTitle; }
    Instant getIssuedAt()                { return issuedAt; }
    int getTotalTopics()                 { return totalTopics; }
    Double getAvgQuizScore()             { return avgQuizScore; }
    String getPdfUrl()                   { return pdfUrl; }
    boolean isRevoked()                  { return revoked; }

    void setUserId(UUID v)               { userId = v; }
    void setPathSlug(String v)           { pathSlug = v; }
    void setPathTitle(String v)          { pathTitle = v; }
    void setTotalTopics(int v)           { totalTopics = v; }
    void setAvgQuizScore(Double v)       { avgQuizScore = v; }
    void setPdfUrl(String v)             { pdfUrl = v; }
    void setRevoked(boolean v)           { revoked = v; }
    void setRevokedReason(String v)      { revokedReason = v; }
}

