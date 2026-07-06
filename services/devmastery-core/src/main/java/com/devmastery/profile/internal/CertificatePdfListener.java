package com.devmastery.profile.internal;

import com.devmastery.storage.api.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listens for {@link CertificateIssuedEvent} and, in a background thread:
 * <ol>
 *   <li>Resolves the learner's display name from the DB</li>
 *   <li>Generates a PDF via {@link PdfCertificateGenerator}</li>
 *   <li>Uploads the PDF to Supabase Storage (bucket: {@code certificates})</li>
 *   <li>Writes the public URL back to the {@code certificates} row</li>
 * </ol>
 * If any step fails the certificate remains valid — only the PDF link is absent.
 */
@Component
class CertificatePdfListener {

    private static final Logger log = LoggerFactory.getLogger(CertificatePdfListener.class);
    private static final String BUCKET = "certificates";

    private final PdfCertificateGenerator generator;
    private final StorageService storage;
    private final CertificateRepository repo;
    private final JdbcTemplate jdbc;
    private final String appBaseUrl;

    CertificatePdfListener(
            PdfCertificateGenerator generator,
            StorageService storage,
            CertificateRepository repo,
            JdbcTemplate jdbc,
            @Value("${app.base-url:https://devmastery.io}") String appBaseUrl) {
        this.generator  = generator;
        this.storage    = storage;
        this.repo       = repo;
        this.jdbc       = jdbc;
        this.appBaseUrl = appBaseUrl;
    }

    @Async
    @EventListener
    @Transactional
    public void onCertificateIssued(CertificateIssuedEvent event) {
        log.info("Generating PDF for certificate {} (user {})", event.certificateId(), event.userId());

        try {
            String learnerName = resolveLearnerName(event.userId().toString());

            byte[] pdfBytes = generator.generate(
                    learnerName,
                    event.pathTitle(),
                    event.totalTopics(),
                    event.avgQuizScore(),
                    java.time.Instant.now(),
                    event.credentialId(),
                    appBaseUrl);

            String path = "cert-" + event.credentialId() + ".pdf";
            String url  = storage.uploadBytes(BUCKET, path, pdfBytes, "application/pdf");

            repo.updatePdfUrl(event.certificateId(), url);
            log.info("PDF uploaded for credential {}: {}", event.credentialId(), url);

        } catch (Exception ex) {
            log.error("PDF pipeline failed for certificate {} — cert still valid, pdf_url will be null",
                    event.certificateId(), ex);
        }
    }

    // ── helpers ──────────────────────────────────────────────────

    /**
     * Tries auth.users.raw_user_meta_data for full_name/name, falls back to email.
     * Silently returns "Learner" if anything fails (e.g. schema access denied).
     */
    private String resolveLearnerName(String userIdStr) {
        try {
            return jdbc.queryForObject(
                    """
                    SELECT COALESCE(
                        raw_user_meta_data->>'full_name',
                        raw_user_meta_data->>'name',
                        email,
                        'Learner')
                    FROM auth.users WHERE id = ?::uuid
                    """,
                    String.class, userIdStr);
        } catch (Exception e) {
            log.debug("Could not resolve learner name for user {}: {}", userIdStr, e.getMessage());
            return "Learner";
        }
    }
}

