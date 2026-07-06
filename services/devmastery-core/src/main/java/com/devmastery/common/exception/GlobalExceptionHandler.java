package com.devmastery.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> bad(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        return build(HttpStatus.BAD_REQUEST, "Validation failed: " + ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> auth(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> denied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "Access denied");
    }

    /**
     * Upstream (Gemini, Judge0, etc.) returned an HTTP error via WebClient.
     * Surface the upstream status so the UI can show an actionable message
     * (e.g. rate-limit) instead of a generic 500.
     */
    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> upstream(WebClientResponseException ex) {
        int code = ex.getStatusCode().value();
        HttpStatus status = switch (code) {
            case 429 -> HttpStatus.TOO_MANY_REQUESTS;
            case 401, 403 -> HttpStatus.BAD_GATEWAY;      // upstream auth failure
            default -> code >= 500 ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
        };
        String msg = switch (code) {
            case 429 -> "Upstream AI service is rate-limited. Please retry shortly.";
            case 401, 403 -> "Upstream AI service rejected credentials. Contact an administrator.";
            default -> "Upstream AI service error (" + code + "). Please retry.";
        };
        return build(status, msg);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> any(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String msg) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", msg);
        return ResponseEntity.status(status).body(body);
    }
}
