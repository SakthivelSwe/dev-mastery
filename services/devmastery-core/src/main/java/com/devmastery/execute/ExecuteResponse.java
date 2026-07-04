package com.devmastery.execute;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ExecuteResponse(
        String  stdout,
        String  stderr,
        String  compileOutput,
        String  message,
        Integer statusId,
        String  statusDescription,
        Double  time,
        Integer memory
) {}

