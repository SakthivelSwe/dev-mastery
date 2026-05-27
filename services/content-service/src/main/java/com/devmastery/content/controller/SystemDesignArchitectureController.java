package com.devmastery.content.controller;

import com.devmastery.content.model.SystemDesignArchitecture;
import com.devmastery.content.repository.SystemDesignArchitectureRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/system-design")
@CrossOrigin(origins = "*")
public class SystemDesignArchitectureController {

    private final SystemDesignArchitectureRepository repository;

    public SystemDesignArchitectureController(SystemDesignArchitectureRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<SystemDesignArchitecture>> getAllArchitectures() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<SystemDesignArchitecture> getArchitectureBySlug(@PathVariable String slug) {
        return repository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
