package com.devmastery.execution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CodeExecutionRequest(
    @NotBlank String sourceCode,
    @NotNull Integer languageId,
    String expectedOutput, // For testing against test cases
    String stdin
) {}
