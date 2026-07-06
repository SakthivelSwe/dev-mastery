package com.devmastery.ai.internal;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Persisted mock-interview session. Populated by the {@code ai} module when
 * a learner finishes an interview at <code>/interview</code>. The transcript
 * and scorecard are stored as JSONB so we don't need to design a rigid
 * table shape yet.
 *
 * <p>Kept package-private to preserve the module boundary — other modules
 * must go through {@link InterviewService} (see the {@code api} package)
 * rather than touch this entity directly.</p>
 */
@Entity
@Table(name = "interview_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class InterviewSessionEntity {

    @Id @GeneratedValue @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "topic_slug", nullable = false, length = 255)
    private String topicSlug;

    @Column(name = "target_level", nullable = false, length = 20)
    private String targetLevel;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "verdict", length = 40)
    private String verdict;

    /** Scores + free-form feedback stored as JSONB. */
    @Column(name = "score_json", columnDefinition = "jsonb")
    private String scoreJson;

    /** Chat transcript as a JSONB array of {role, content, at}. */
    @Column(name = "transcript", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String transcript = "[]";
}

