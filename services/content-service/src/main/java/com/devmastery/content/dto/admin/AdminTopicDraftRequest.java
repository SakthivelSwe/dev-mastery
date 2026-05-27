package com.devmastery.content.dto.admin;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record AdminTopicDraftRequest(
        @NotBlank String title,
        @NotBlank String slug,
        Integer level,
        Integer estimatedMins,
        Boolean hasVisualizer,
        Boolean hasCodeLab,
        List<String> tags,
        List<AdminSectionDraftRequest> sections
) {}
