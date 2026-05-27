package com.devmastery.execution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExecutionRequest(
    @NotBlank String sourceCode,
    @NotNull Integer languageId,
    String expectedOutput,
    String stdin
) {}
