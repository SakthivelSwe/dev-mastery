package com.devmastery.execution.service;

import com.devmastery.execution.dto.Judge0SubmissionRequest;
import com.devmastery.execution.dto.Judge0SubmissionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class Judge0Client {

    private final WebClient.Builder webClientBuilder;

    @Value("${judge0.url}")
    private String judge0Url;

    public Mono<String> submitCode(Judge0SubmissionRequest request) {
        return webClientBuilder.build()
                .post()
                .uri(judge0Url + "/submissions?base64_encoded=false&wait=false")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Judge0SubmissionResponse.class)
                .map(Judge0SubmissionResponse::getToken)
                .doOnError(e -> log.error("Failed to submit code to Judge0", e));
    }

    public Mono<Judge0SubmissionResponse> getSubmission(String token) {
        return webClientBuilder.build()
                .get()
                .uri(judge0Url + "/submissions/" + token + "?base64_encoded=false")
                .retrieve()
                .bodyToMono(Judge0SubmissionResponse.class)
                .doOnError(e -> log.error("Failed to get submission from Judge0", e));
    }
}
