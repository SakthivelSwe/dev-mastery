package com.devmastery.profile.web;

import com.devmastery.profile.api.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/certificates")
public class CertificateController {

    private final CertificateService certs;

    public CertificateController(CertificateService certs) {
        this.certs = certs;
    }

    /** POST /v1/certificates/{pathSlug} — claim certificate for completed path */
    @PostMapping("/{pathSlug}")
    public ResponseEntity<CertificateService.CertificateView> claim(
            @PathVariable String pathSlug,
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(certs.issue(userId, pathSlug));
    }

    /** GET /v1/certificates — list own certificates */
    @GetMapping
    public ResponseEntity<List<CertificateService.CertificateView>> list(
            @AuthenticationPrincipal(errorOnInvalidType = false) UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(certs.listForUser(userId));
    }

    /** GET /v1/certificates/verify/{credentialId} — public verification (no auth) */
    @GetMapping("/verify/{credentialId}")
    public CertificateService.CertificateView verify(@PathVariable UUID credentialId) {
        return certs.verify(credentialId);
    }
}
