package com.devmastery.content.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * CodeSeedService — Admin service to ingest and seed Code Examples from generated JSON artifacts.
 *
 * In a real environment, this would call the Gemini API directly to generate the code
 * and then validate it via Judge0 before saving. For this prototype phase, it
 * ingests the pre-generated JSON artifacts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CodeSeedService {

    private final ObjectMapper objectMapper;

    /**
     * Stub for the full async seeding process.
     * Reads a pre-generated JSON artifact and simulates saving it.
     *
     * @param artifactPath The absolute path to the JSON artifact file.
     */
    public void ingestSeedArtifact(String artifactPath) {
        log.info("Ingesting code seed artifact from: {}", artifactPath);
        try {
            Path path = Paths.get(artifactPath);
            if (!Files.exists(path)) {
                log.error("Artifact not found: {}", artifactPath);
                return;
            }

            String jsonContent = Files.readString(path);
            
            // Just verifying that it's parseable as a list of maps
            List<?> examples = objectMapper.readValue(jsonContent, List.class);
            log.info("Successfully parsed {} code examples from artifact.", examples.size());
            
            // TODO: Iterate over examples, convert to CodeExample entity, and save using CodeExampleBySlugRepository

        } catch (Exception e) {
            log.error("Failed to ingest seed artifact: {}", e.getMessage());
        }
    }
    
    /**
     * Stub for Gemini code generation.
     */
    public void generateExamplesForTopic(String topicSlug) {
        log.info("Triggering async AI code generation for topic: {}", topicSlug);
        // TODO: Call Gemini SDK, compile against Judge0, save to DB
    }
}
