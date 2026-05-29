package com.devmastery.ai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("interview_sessions")
public class InterviewSession {
    @Id
    private UUID id;
    private UUID userId;
    private String topicSlug;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer score;
    private String feedback;
    private String transcript; // JSON string of chat history
}
