package com.devmastery.content.dto.admin;

import java.util.List;
import java.util.Map;

public record ValidationReport(
        String slug,
        boolean isValid,
        int totalWordCount,
        Map<String, SectionValidation> sections
) {
    public record SectionValidation(
            int wordCount,
            boolean hasContent,
            List<String> warnings
    ) {}
}
