package com.devmastery.ai.internal;

import com.devmastery.ai.api.InterviewService;
import com.devmastery.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Persists mock-interview transcripts + scorecards. JSON serialisation is
 * done in-service so the entity stays simple (plain String columns) — no
 * need for a JPA type converter.
 */
@Service
class InterviewServiceImpl implements InterviewService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final InterviewSessionRepository repo;

    InterviewServiceImpl(InterviewSessionRepository repo) { this.repo = repo; }

    @Override
    @Transactional
    public UUID save(SaveRequest req) {
        var entity = InterviewSessionEntity.builder()
                .userId(req.userId())
                .topicSlug(req.topicSlug())
                .targetLevel(req.targetLevel())
                .startedAt(req.startedAt() == null ? Instant.now() : req.startedAt())
                .endedAt(req.endedAt())
                .verdict(req.scoreCard() == null ? null : req.scoreCard().verdict())
                .scoreJson(writeJson(req.scoreCard()))
                .transcript(writeJson(req.transcript() == null ? List.of() : req.transcript()))
                .build();
        return repo.save(entity).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionSummary> listForUser(UUID userId) {
        return repo.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(e -> new SessionSummary(
                        e.getId(), e.getTopicSlug(), e.getTargetLevel(),
                        e.getStartedAt(), e.getEndedAt(), e.getVerdict()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SessionDetail get(UUID userId, UUID sessionId) {
        var entity = repo.findById(sessionId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        var summary = new SessionSummary(entity.getId(), entity.getTopicSlug(),
                entity.getTargetLevel(), entity.getStartedAt(),
                entity.getEndedAt(), entity.getVerdict());
        return new SessionDetail(summary,
                readTranscript(entity.getTranscript()),
                readScoreCard(entity.getScoreJson()));
    }

    @Override
    @Transactional
    public ScoreCard grade(UUID userId, UUID sessionId, String scorecardMarkdown) {
        var entity = repo.findById(sessionId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        ScoreCard card = InterviewScorecardParser.parse(scorecardMarkdown);
        entity.setVerdict(card.verdict());
        entity.setScoreJson(writeJson(card));
        if (entity.getEndedAt() == null) entity.setEndedAt(Instant.now());
        repo.save(entity);
        return card;
    }

    // ─── JSON helpers (isolated so tests can stub) ──────────────

    private static String writeJson(Object o) {
        if (o == null) return null;
        try {
            return JSON.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot serialize interview payload", e);
        }
    }

    private static List<TranscriptTurn> readTranscript(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            var arr = JSON.readTree(json);
            var out = new ArrayList<TranscriptTurn>();
            for (JsonNode n : arr) {
                out.add(new TranscriptTurn(
                        n.path("role").asText(""),
                        n.path("content").asText(""),
                        n.hasNonNull("at") ? Instant.parse(n.get("at").asText()) : null));
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    private static ScoreCard readScoreCard(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return JSON.readValue(json, ScoreCard.class);
        } catch (Exception e) {
            return null;
        }
    }
}

