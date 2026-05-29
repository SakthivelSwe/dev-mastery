package com.devmastery.execution.controller;

import com.devmastery.execution.dto.CodeExecutionRequest;
import com.devmastery.execution.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @MessageMapping("/execute/{sessionId}")
    public void executeCode(@DestinationVariable String sessionId, @Payload CodeExecutionRequest request) {
        log.info("Received execution request for session: {}", sessionId);
        executionService.executeCode(sessionId, request);
    }
}
