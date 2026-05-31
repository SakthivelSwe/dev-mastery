package com.devmastery.ai.dto;

import lombok.Data;

@Data
public class HintRequest {
    private String topicSlug;
    private String problemContext;
    private int hintLevel; 
    private String currentCode;
}
