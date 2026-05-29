package com.devmastery.execution.dto;

public record CodeExecutionResponse(
    String stdout,
    String stderr,
    String compileOutput,
    String message,
    Integer statusId,
    String statusDescription,
    Float time,
    Integer memory
) {}
