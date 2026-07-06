package com.devmastery.ai.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Persistence surface for mock-interview transcripts + scorecards.
 * Implemented package-privately inside the {@code ai.internal} package.
 */
public interface InterviewService {

    /** Persist a completed interview. Returns the assigned id. */
    UUID save(SaveRequest request);

    /** List a user's past interviews, newest first. */
    List<SessionSummary> listForUser(UUID userId);

    /** Full transcript + scorecard for one session. */
    SessionDetail get(UUID userId, UUID sessionId);

    /**
     * Parse the AI interviewer's final markdown scorecard, store the
     * structured result on the session, and return the score card.
     */
    ScoreCard grade(UUID userId, UUID sessionId, String scorecardMarkdown);

    // ─── DTOs ─────────────────────────────────────────────────────

    record TranscriptTurn(String role, String content, Instant at) { }

    record ScoreCard(String verdict, int technical, int communication,
                     int problemSolving, int seniority,
                     List<String> strengths, List<String> improvements) { }

    record SaveRequest(UUID userId, String topicSlug, String targetLevel,
                       Instant startedAt, Instant endedAt,
                       List<TranscriptTurn> transcript, ScoreCard scoreCard) { }

    record SessionSummary(UUID id, String topicSlug, String targetLevel,
                          Instant startedAt, Instant endedAt, String verdict) { }

    record SessionDetail(SessionSummary summary,
                         List<TranscriptTurn> transcript,
                         ScoreCard scoreCard) { }
}

