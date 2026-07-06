package com.devmastery.profile.internal;

import java.util.UUID;

/**
 * Published synchronously after a {@link CertificateEntity} is saved.
 * The async PDF listener picks it up and generates/uploads the PDF in a
 * background thread, then writes the {@code pdf_url} back to the row.
 */
record CertificateIssuedEvent(
        UUID certificateId,
        UUID credentialId,
        UUID userId,
        String pathTitle,
        int totalTopics,
        Double avgQuizScore,
        String appBaseUrl
) {}

