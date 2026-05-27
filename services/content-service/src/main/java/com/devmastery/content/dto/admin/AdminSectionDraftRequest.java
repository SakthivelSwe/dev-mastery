package com.devmastery.content.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminSectionDraftRequest(
        @NotBlank String sectionType,
        @NotNull String contentMdx
) {}
