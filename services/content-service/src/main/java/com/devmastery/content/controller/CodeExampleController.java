package com.devmastery.content.controller;

import com.devmastery.content.dto.CodeExampleResponse;
import com.devmastery.content.service.CodeExampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Code Lab tier/language API.
 *
 * Endpoints:
 *   GET /v1/topics/{topicSlug}/code?tier=easy&lang=java
 *   GET /v1/topics/{topicSlug}/code/languages?tier=easy
 */
@RestController
@RequestMapping("/v1/topics")
@Tag(name = "Code Examples", description = "Tier-aware code examples for the Code Lab")
public class CodeExampleController {

    private final CodeExampleService codeExampleService;

    public CodeExampleController(CodeExampleService codeExampleService) {
        this.codeExampleService = codeExampleService;
    }

    /**
     * GET /v1/topics/{topicSlug}/code?tier=easy&lang=java
     *
     * Returns the published code example for the given topic slug, difficulty tier,
     * and programming language. Used by the Code Lab tab to load Solution.java.
     *
     * Returns 404 if no published example exists for the combination.
     */
    @Operation(
        summary = "Get code example by slug, tier, and language",
        description = "Returns a complete compilable code example for the Code Lab. " +
                      "The response includes the code, explanation, tricks, time/space complexity, and pattern name."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Code example found",
            content = @Content(schema = @Schema(implementation = CodeExampleResponse.class))),
        @ApiResponse(responseCode = "404", description = "No published code example found for the given slug/tier/language",
            content = @Content),
    })
    @GetMapping("/{topicSlug}/code")
    public ResponseEntity<CodeExampleResponse> getCodeExample(

        @Parameter(description = "Topic URL slug, e.g. 'array-basics'", required = true, example = "array-basics")
        @PathVariable String topicSlug,

        @Parameter(description = "Difficulty tier", schema = @Schema(allowableValues = {"easy","intermediate","expert","advanced"}))
        @RequestParam(defaultValue = "easy") String tier,

        @Parameter(description = "Programming language", schema = @Schema(allowableValues = {"java","python","javascript","cpp"}))
        @RequestParam(name = "lang", defaultValue = "java") String lang
    ) {
        CodeExampleResponse response = codeExampleService.getCodeExample(topicSlug, tier, lang);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /v1/topics/{topicSlug}/code/languages?tier=easy
     *
     * Returns the list of available programming languages for the given slug + tier.
     * The frontend uses this to enable/disable language selector tabs.
     *
     * Example response: ["java"]  (Python not yet seeded → disabled with "coming soon" tooltip)
     */
    @Operation(
        summary = "Get available languages for a topic+tier",
        description = "Returns only the languages that have published code examples for this topic and tier. " +
                      "Languages not in this list should be shown as disabled in the UI."
    )
    @ApiResponse(responseCode = "200", description = "List of available language strings",
        content = @Content(schema = @Schema(type = "array", example = "[\"java\"]")))
    @GetMapping("/{topicSlug}/code/languages")
    public ResponseEntity<List<String>> getAvailableLanguages(

        @Parameter(description = "Topic URL slug", required = true, example = "array-basics")
        @PathVariable String topicSlug,

        @Parameter(description = "Difficulty tier to check languages for")
        @RequestParam(defaultValue = "easy") String tier
    ) {
        List<String> languages = codeExampleService.getAvailableLanguages(topicSlug, tier);
        return ResponseEntity.ok(languages);
    }
}
