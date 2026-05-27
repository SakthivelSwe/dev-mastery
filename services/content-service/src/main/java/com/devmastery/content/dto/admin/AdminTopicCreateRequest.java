package com.devmastery.content.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminTopicCreateRequest(
        @NotNull UUID pathId,
        @NotBlank String title,
        @NotBlank String slug,
        @NotNull Integer level,
        @NotNull Integer orderIndex
) {}
