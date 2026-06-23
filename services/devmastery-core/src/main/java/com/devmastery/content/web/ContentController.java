package com.devmastery.content.web;

import com.devmastery.content.api.ContentCommandService;
import com.devmastery.content.api.ContentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
public class ContentController {

    private final ContentService content;
    private final ContentCommandService commands;

    public ContentController(ContentService content, ContentCommandService commands) {
        this.content = content; this.commands = commands;
    }

    @GetMapping("/topics")
    public List<ContentService.TopicSummary> topics(
            @RequestParam(required = false) String pathSlug,
            @RequestParam(required = false) Integer level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return content.listTopics(pathSlug, level, page, size);
    }

    @GetMapping("/topics/{slug}")
    public ContentService.TopicDetail topic(@PathVariable String slug) {
        return content.getTopicBySlug(slug);
    }

    @GetMapping("/topics/{topicId}/lessons")
    public List<ContentService.LessonView> lessons(@PathVariable UUID topicId) {
        return content.getLessonsByTopic(topicId);
    }

    @GetMapping("/paths")
    public List<ContentService.PathSummary> paths() { return content.listPaths(); }

    @GetMapping("/paths/{slug}")
    public ContentService.PathDetail path(@PathVariable String slug) {
        return content.getPathBySlug(slug);
    }

    @GetMapping("/paths/{slug}/roadmap")
    public ContentService.PathRoadmap roadmap(
            @PathVariable String slug,
            @AuthenticationPrincipal UUID userId) {
        return content.getPathRoadmap(slug, userId);
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public void completeLesson(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID lessonId) {
        commands.completeLesson(userId, lessonId);
    }
}
