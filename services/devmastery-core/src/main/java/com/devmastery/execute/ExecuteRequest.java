package com.devmastery.execute;

public record ExecuteRequest(
        String sourceCode,
        int    languageId,
        String stdin
) {}

