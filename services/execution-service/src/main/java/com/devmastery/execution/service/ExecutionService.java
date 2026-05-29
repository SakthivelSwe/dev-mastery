package com.devmastery.execution.service;

import com.devmastery.execution.dto.CodeExecutionRequest;
import com.devmastery.execution.dto.CodeExecutionResponse;
import com.devmastery.execution.dto.Judge0SubmissionRequest;
import com.devmastery.execution.dto.Judge0SubmissionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final Judge0Client judge0Client;
    private final SimpMessagingTemplate messagingTemplate;

    public void executeCode(String sessionId, CodeExecutionRequest request) {
        Judge0SubmissionRequest submissionRequest = Judge0SubmissionRequest.builder()
                .sourceCode(request.sourceCode())
                .languageId(request.languageId())
                .stdin(request.stdin())
                .expectedOutput(request.expectedOutput())
                .build();

        judge0Client.submitCode(submissionRequest)
                .subscribe(
                        token -> pollForResults(sessionId, token),
                        error -> sendError(sessionId, "Failed to submit code to Judge0: " + error.getMessage())
                );
    }

    private void pollForResults(String sessionId, String token) {
        Mono.defer(() -> judge0Client.getSubmission(token))
                .flatMap(response -> {
                    // Status 1 = In Queue, 2 = Processing
                    if (response.getStatus() != null && (response.getStatus().getId() == 1 || response.getStatus().getId() == 2)) {
                        return Mono.<Judge0SubmissionResponse>empty(); // Trigger repeatWhenEmpty
                    }
                    return Mono.just(response);
                })
                .repeatWhenEmpty(repeat -> repeat.delayElements(Duration.ofMillis(500)))
                .subscribe(
                        response -> sendResult(sessionId, response),
                        error -> sendError(sessionId, "Failed to get execution results: " + error.getMessage())
                );
    }

    private void sendResult(String sessionId, Judge0SubmissionResponse response) {
        CodeExecutionResponse result = new CodeExecutionResponse(
                response.getStdout(),
                response.getStderr(),
                response.getCompileOutput(),
                response.getMessage(),
                response.getStatus() != null ? response.getStatus().getId() : null,
                response.getStatus() != null ? response.getStatus().getDescription() : null,
                response.getTime(),
                response.getMemory()
        );
        messagingTemplate.convertAndSend("/topic/execution/" + sessionId, result);
    }

    private void sendError(String sessionId, String message) {
        CodeExecutionResponse errorResult = new CodeExecutionResponse(
                null, null, null, message, null, "Error", null, null
        );
        messagingTemplate.convertAndSend("/topic/execution/" + sessionId, errorResult);
    }
}
