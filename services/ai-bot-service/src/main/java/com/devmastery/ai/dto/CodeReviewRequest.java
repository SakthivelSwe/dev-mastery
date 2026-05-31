package com.devmastery.ai.dto;

import lombok.Data;

@Data
public class CodeReviewRequest {
    private String topicSlug;
    private String code;
    private String language;
}
