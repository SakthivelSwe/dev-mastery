package com.devmastery.profile.internal;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link PdfCertificateGenerator}.
 * <p>
 * These run without a Spring context — the generator is a pure POJO.
 * We verify that it produces a valid PDF byte array (starts with the %PDF header)
 * and that edge cases are handled gracefully.
 */
class PdfCertificateGeneratorTest {

    private final PdfCertificateGenerator generator = new PdfCertificateGenerator();

    private static final UUID CREDENTIAL_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @Test
    void generate_producesValidPdfHeader() {
        byte[] pdf = generator.generate(
                "Alice Developer",
                "Java Mastery Path",
                42,
                88.5,
                Instant.now(),
                CREDENTIAL_ID,
                "https://devmastery.io");

        assertThat(pdf).isNotNull().hasSizeGreaterThan(1000);
        // PDF magic bytes: %PDF
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void generate_withNullAvgScore_doesNotThrow() {
        byte[] pdf = generator.generate(
                "Bob Engineer",
                "System Design Path",
                15,
                null,       // no quiz attempts yet
                Instant.now(),
                CREDENTIAL_ID,
                "https://devmastery.io");

        assertThat(pdf).isNotNull();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void generate_withSpecialCharactersInName_doesNotThrow() {
        // Standard fonts can't render some Unicode but should not crash
        byte[] pdf = generator.generate(
                "José García",
                "JavaScript Path",
                20,
                75.0,
                Instant.now(),
                CREDENTIAL_ID,
                "https://devmastery.io");

        assertThat(pdf).isNotNull();
    }

    @Test
    void generate_producesDifferentOutputForDifferentCredentials() {
        UUID cred1 = UUID.randomUUID();
        UUID cred2 = UUID.randomUUID();

        byte[] pdf1 = generator.generate("Alice", "Java Path", 10, 90.0, Instant.now(), cred1, "https://devmastery.io");
        byte[] pdf2 = generator.generate("Alice", "Java Path", 10, 90.0, Instant.now(), cred2, "https://devmastery.io");

        // Different credential IDs must produce different PDF content (QR code + UUID text differs)
        assertThat(pdf1).isNotEqualTo(pdf2);
    }
}

