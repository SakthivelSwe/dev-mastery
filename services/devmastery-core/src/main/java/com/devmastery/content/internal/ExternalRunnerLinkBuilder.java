package com.devmastery.content.internal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Builds "Try Online" URLs for code examples — replaces server-side execution.
 * Returns simple playground URLs (users paste code manually).
 * Templates are configured in {@code application.yml} under {@code app.runners.*}
 * and can be overridden per-language via the {@code runner_templates} DB table (admin).
 */
@Component
class ExternalRunnerLinkBuilder {

    private final Map<String, String> templates = new HashMap<>();

    ExternalRunnerLinkBuilder(
            @Value("${app.runners.java:https://onecompiler.com/java}")     String javaTpl,
            @Value("${app.runners.javascript:https://jsfiddle.net}")       String jsTpl,
            @Value("${app.runners.python:https://www.programiz.com/python-programming/online-compiler/}") String pyTpl,
            @Value("${app.runners.kotlin:https://play.kotlinlang.org}")    String ktTpl,
            @Value("${app.runners.sql:https://sqliteonline.com}")          String sqlTpl,
            @Value("${app.runners.default:https://onecompiler.com/}")      String defTpl) {
        templates.put("java", javaTpl);
        templates.put("javascript", jsTpl);
        templates.put("typescript", jsTpl);
        templates.put("python", pyTpl);
        templates.put("kotlin", ktTpl);
        templates.put("sql", sqlTpl);
        templates.put("default", defTpl);
    }

    String build(String language, String code) {
        return templates.getOrDefault(
                language == null ? "default" : language.toLowerCase(),
                templates.get("default"));
    }
}
