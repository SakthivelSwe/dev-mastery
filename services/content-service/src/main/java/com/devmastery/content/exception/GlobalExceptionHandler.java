package com.devmastery.content.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Centralised exception handling for the content-service.
 *
 * Response format (per spec):
 * { "error": "TOPIC_NOT_FOUND", "message": "...", "timestamp": "..." }
 *
 * SonarQube compliance: catch and log OR throw — never both (S2139).
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(TopicNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTopicNotFound(TopicNotFoundException ex) {
        return errorResponse(HttpStatus.NOT_FOUND, "TOPIC_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(PathNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePathNotFound(PathNotFoundException ex) {
        return errorResponse(HttpStatus.NOT_FOUND, "PATH_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        return errorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "INVALID_PARAMETER",
                "Invalid value for parameter: " + ex.getName());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        // Log here — do NOT re-throw (SonarQube S2139: log OR throw, not both)
        log.error("Unhandled exception in content-service", ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Please try again.");
    }

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String error, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "error", error,
                "message", message,
                "timestamp", OffsetDateTime.now().toString()
        ));
    }
}
