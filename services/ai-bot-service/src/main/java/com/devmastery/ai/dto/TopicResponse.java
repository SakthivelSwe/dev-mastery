package com.devmastery.ai.dto;

public record TopicResponse(
    String id,
    String slug,
    String title,
    String description,
    Integer level,
    String contentMdx
) {}
