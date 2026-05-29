package com.devmastery.execution.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Judge0SubmissionRequest {
    @JsonProperty("source_code")
    private String sourceCode;
    
    @JsonProperty("language_id")
    private Integer languageId;
    
    @JsonProperty("stdin")
    private String stdin;
    
    @JsonProperty("expected_output")
    private String expectedOutput;
}
