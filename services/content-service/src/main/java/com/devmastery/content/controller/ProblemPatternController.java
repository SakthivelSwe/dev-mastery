package com.devmastery.content.controller;

import com.devmastery.content.model.ProblemPattern;
import com.devmastery.content.repository.ProblemPatternRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/patterns")
@CrossOrigin(origins = "*")
public class ProblemPatternController {

    private final ProblemPatternRepository repository;

    public ProblemPatternController(ProblemPatternRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<ProblemPattern>> getAllPatterns() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProblemPattern> getPatternBySlug(@PathVariable String slug) {
        return repository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
