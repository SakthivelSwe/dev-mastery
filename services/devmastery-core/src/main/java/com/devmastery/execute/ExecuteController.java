package com.devmastery.execute;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin proxy to Judge0 (RapidAPI).
 * Reads JUDGE0_API_KEY from environment — already set in Render.
 * Tries primary provider first; falls back to secondary on failure.
 *
 * POST /v1/execute
 * Body: { sourceCode, languageId, stdin }
 */
@Slf4j
@RestController
@RequestMapping("/v1/execute")
public class ExecuteController {

    private static final int MAX_POLLS    = 20;
    private static final int POLL_DELAY   = 600; // ms

    @Value("${judge0.api-key:}")
    private String apiKey;

    @Value("${judge0.primary-url:https://judge029.p.rapidapi.com}")
    private String primaryUrl;

    @Value("${judge0.primary-host:judge029.p.rapidapi.com}")
    private String primaryHost;

    @Value("${judge0.fallback-url:https://judge0-ce.p.rapidapi.com}")
    private String fallbackUrl;

    @Value("${judge0.fallback-host:judge0-ce.p.rapidapi.com}")
    private String fallbackHost;

    private final RestTemplate http = new RestTemplate();

    private ResponseEntity<ExecuteResponse> ok(ExecuteResponse r) {
        return ResponseEntity.ok(r);
    }

    @PostMapping
    public ResponseEntity<ExecuteResponse> execute(@RequestBody ExecuteRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            return ok(new ExecuteResponse(
                    null, null, null,
                    "JUDGE0_API_KEY not configured on the server.",
                    0, "Not Configured", null, null));
        }

        // Try providers in order
        for (Provider p : providers()) {
            String token = submit(p, req);
            if (token == null) continue;

            ExecuteResponse result = poll(p, token);
            if (result != null) return ok(result);
        }

        return ok(new ExecuteResponse(
                null, null, null,
                "All execution providers unavailable. Try again later.",
                0, "Unavailable", null, null));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String submit(Provider p, ExecuteRequest req) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("source_code", b64(req.sourceCode()));
            body.put("language_id", req.languageId());
            body.put("stdin",       b64(req.stdin() != null ? req.stdin() : ""));

            ResponseEntity<Judge0SubmitResponse> res = http.exchange(
                    p.url + "/submissions?base64_encoded=true&wait=false",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers(p.host)),
                    Judge0SubmitResponse.class);

            if (res.getStatusCode().is2xxSuccessful()
                    && res.getBody() != null
                    && res.getBody().getToken() != null) {
                log.info("[execute] submitted via {} token={}", p.name, res.getBody().getToken());
                return res.getBody().getToken();
            }
        } catch (Exception e) {
            log.warn("[execute] {} submit failed: {}", p.name, e.getMessage());
        }
        return null;
    }

    private ExecuteResponse poll(Provider p, String token) {
        for (int i = 0; i < MAX_POLLS; i++) {
            try { Thread.sleep(POLL_DELAY); } catch (InterruptedException ignored) {}
            try {
                ResponseEntity<Judge0ResultResponse> res = http.exchange(
                        p.url + "/submissions/" + token
                                + "?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory",
                        HttpMethod.GET,
                        new HttpEntity<>(headers(p.host)),
                        Judge0ResultResponse.class);

                if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) continue;

                Judge0ResultResponse d = res.getBody();
                int statusId = d.getStatus() != null ? d.getStatus().getId() : 0;
                if (statusId == 1 || statusId == 2) continue; // still processing

                return new ExecuteResponse(
                        fromB64(d.getStdout()),
                        fromB64(d.getStderr()),
                        fromB64(d.getCompileOutput()),
                        d.getMessage(),
                        statusId,
                        d.getStatus() != null ? d.getStatus().getDescription() : "Unknown",
                        d.getTime() != null ? Double.parseDouble(d.getTime()) : null,
                        d.getMemory());
            } catch (Exception e) {
                log.warn("[execute] {} poll error: {}", p.name, e.getMessage());
            }
        }
        return null;
    }

    private HttpHeaders headers(String host) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        h.set("X-RapidAPI-Key",  apiKey);
        h.set("X-RapidAPI-Host", host);
        return h;
    }

    private List<Provider> providers() {
        return List.of(
                new Provider("judge029",  primaryUrl,  primaryHost),
                new Provider("judge0-ce", fallbackUrl, fallbackHost));
    }

    private static String b64(String s) {
        return Base64.getEncoder().encodeToString(s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String fromB64(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return new String(Base64.getDecoder().decode(s), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }

    private record Provider(String name, String url, String host) {}
}


