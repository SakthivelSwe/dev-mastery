package com.devmastery.content.dto.admin;

public record AdminTopicSectionsImportRequest(
        String why,
        String theory,
        String visual,
        String code,
        String realWorld,
        String interview,
        String feynman,
        String build,
        String spacedReview
) {}
