package com.devmastery.execution.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Judge0SubmissionResponse {
    private String token;
    
    private String stdout;
    
    private String stderr;
    
    @JsonProperty("compile_output")
    private String compileOutput;
    
    private String message;
    
    private Status status;
    
    private Float time;
    
    private Integer memory;

    @Data
    public static class Status {
        private Integer id;
        private String description;
    }
}
