package com.devmastery.profile.internal;

import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.profile.api.CertificateService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository repo;
    private final JdbcTemplate jdbc;

    CertificateServiceImpl(CertificateRepository repo, JdbcTemplate jdbc) {
        this.repo = repo;
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public CertificateView issue(UUID userId, String pathSlug) {
        // Return existing certificate if already issued
        return repo.findByUserIdAndPathSlug(userId, pathSlug)
                .map(this::toView)
                .orElseGet(() -> {
                    CompletionStats stats = calcCompletionStats(userId, pathSlug);
                    if (!stats.allComplete()) {
                        throw new IllegalStateException(
                                "Path not fully completed: " + stats.completed() +
                                "/" + stats.total() + " topics done");
                    }

                    CertificateEntity cert = new CertificateEntity();
                    cert.setUserId(userId);
                    cert.setPathSlug(pathSlug);
                    cert.setPathTitle(stats.pathTitle());
                    cert.setTotalTopics(stats.total());
                    cert.setAvgQuizScore(stats.avgScore());
                    repo.save(cert);
                    return toView(cert);
                });
    }

    @Override
    public List<CertificateView> listForUser(UUID userId) {
        return repo.findByUserIdOrderByIssuedAtDesc(userId)
                .stream().map(this::toView).toList();
    }

    @Override
    public CertificateView verify(UUID credentialId) {
        return repo.findByCredentialId(credentialId)
                .map(this::toView)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Certificate not found: " + credentialId));
    }

    // ── helpers ──────────────────────────────────────────────────

    private CertificateView toView(CertificateEntity e) {
        return new CertificateView(
                e.getId(), e.getCredentialId(), e.getUserId(),
                e.getPathSlug(), e.getPathTitle(), e.getIssuedAt(),
                e.getTotalTopics(), e.getAvgQuizScore(), e.getPdfUrl(),
                e.isRevoked());
    }

    private CompletionStats calcCompletionStats(UUID userId, String pathSlug) {
        // Count published topics in path
        Integer total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM topics t " +
                "JOIN learning_paths lp ON lp.id = t.path_id " +
                "WHERE lp.slug = ? AND t.is_published = true",
                Integer.class, pathSlug);

        // Count completed topics for this user
        Integer completed = jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_topic_progress utp " +
                "JOIN topics t ON t.id = utp.topic_id " +
                "JOIN learning_paths lp ON lp.id = t.path_id " +
                "WHERE utp.user_id = ? AND lp.slug = ? AND utp.completed = true",
                Integer.class, userId, pathSlug);

        // Average quiz score for this path
        Double avgScore = jdbc.queryForObject(
                "SELECT AVG(score_pct) FROM quiz_attempts qa " +
                "JOIN topics t ON t.id = qa.topic_id " +
                "JOIN learning_paths lp ON lp.id = t.path_id " +
                "WHERE qa.user_id = ? AND lp.slug = ?",
                Double.class, userId, pathSlug);

        String pathTitle = jdbc.queryForObject(
                "SELECT title FROM learning_paths WHERE slug = ?",
                String.class, pathSlug);

        int t = total   != null ? total   : 0;
        int c = completed != null ? completed : 0;
        return new CompletionStats(pathTitle, t, c, avgScore);
    }

    private record CompletionStats(String pathTitle, int total, int completed, Double avgScore) {
        boolean allComplete() { return total > 0 && completed >= total; }
    }
}

