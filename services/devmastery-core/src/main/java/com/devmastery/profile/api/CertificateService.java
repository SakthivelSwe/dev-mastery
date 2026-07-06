package com.devmastery.profile.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface CertificateService {

    /** Issue a certificate if the learner has completed every published topic in the path. */
    CertificateView issue(UUID userId, String pathSlug);

    /** List all certificates earned by a user. */
    List<CertificateView> listForUser(UUID userId);

    /** Public verification — no authentication required. */
    CertificateView verify(UUID credentialId);

    record CertificateView(
            UUID   id,
            UUID   credentialId,
            UUID   userId,
            String pathSlug,
            String pathTitle,
            Instant issuedAt,
            int    totalTopics,
            Double avgQuizScore,
            String pdfUrl,
            boolean revoked
    ) {}
}

