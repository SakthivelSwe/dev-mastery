package com.devmastery.execution.service;

import com.devmastery.execution.dto.ExecutionRequest;
import com.devmastery.execution.dto.ExecutionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${judge0.url}")
    private String judge0Url;

    public ExecutionResponse submitCode(ExecutionRequest request) {
        String submitUrl = judge0Url + "/submissions?base64_encoded=false&wait=true";

        Map<String, Object> body = new HashMap<>();
        body.put("source_code", request.sourceCode());
        body.put("language_id", request.languageId());
        if (request.stdin() != null) {
            body.put("stdin", request.stdin());
        }
        if (request.expectedOutput() != null) {
            body.put("expected_output", request.expectedOutput());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(submitUrl, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String stdout = root.path("stdout").asText(null);
            String time = root.path("time").asText(null);
            String memory = root.path("memory").asText(null);
            String stderr = root.path("stderr").asText(null);
            String compileOutput = root.path("compile_output").asText(null);
            String status = root.path("status").path("description").asText("Unknown Error");

            return new ExecutionResponse(stdout, time, memory, stderr, compileOutput, status);
        } catch (Exception e) {
            return new ExecutionResponse(null, null, null, "Internal Error connecting to Execution Engine: " + e.getMessage(), null, "Internal Error");
        }
    }
}
