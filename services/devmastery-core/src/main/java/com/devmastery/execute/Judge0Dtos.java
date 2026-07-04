package com.devmastery.execute;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
class Judge0SubmitResponse {
    private String token;
}

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
class Judge0Status {
    private int    id;
    private String description;
}

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
class Judge0ResultResponse {
    private String       stdout;
    private String       stderr;
    @JsonProperty("compile_output")
    private String       compileOutput;
    private String       message;
    private Judge0Status status;
    private String       time;
    private Integer      memory;
}

