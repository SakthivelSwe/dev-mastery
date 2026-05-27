package com.devmastery.execution.dto;

public record ExecutionResponse(
    String stdout,
    String time,
    String memory,
    String stderr,
    String compileOutput,
    String status
) {}
