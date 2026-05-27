package com.devmastery.content.controller;

import com.devmastery.content.dto.LessonResponse;
import com.devmastery.content.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Lessons.
 *
 * GET /v1/topics/{slug}/lessons — all published lessons for a topic
 */
@RestController
@RequestMapping("/v1/topics")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "6-layer lesson sections within topics")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/{slug}/lessons")
    @Operation(summary = "Get all lessons for a topic",
               description = "Returns lessons ordered: why → theory → visual → code → realworld → interview")
    public ResponseEntity<List<LessonResponse>> getLessons(@PathVariable String slug) {
        return ResponseEntity.ok(lessonService.getLessonsForTopic(slug));
    }
}
