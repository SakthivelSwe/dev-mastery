package com.devmastery.profile.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface CertificateRepository extends JpaRepository<CertificateEntity, UUID> {

    List<CertificateEntity> findByUserIdOrderByIssuedAtDesc(UUID userId);

    Optional<CertificateEntity> findByCredentialId(UUID credentialId);

    Optional<CertificateEntity> findByUserIdAndPathSlug(UUID userId, String pathSlug);

    @Query("SELECT COUNT(c) FROM CertificateEntity c WHERE c.userId = :userId AND c.revoked = false")
    long countActive(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE CertificateEntity c SET c.pdfUrl = :pdfUrl WHERE c.id = :id")
    void updatePdfUrl(@Param("id") UUID id, @Param("pdfUrl") String pdfUrl);

    @Modifying
    @Query("DELETE FROM CertificateEntity c WHERE c.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}

