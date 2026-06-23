package com.devmastery.patterns.web;

import com.devmastery.patterns.api.PatternService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/patterns")
public class PatternController {

    private final PatternService patterns;

    public PatternController(PatternService patterns) { this.patterns = patterns; }

    @GetMapping
    public List<PatternService.PatternSummary> list() {
        return patterns.listPatterns();
    }

    @GetMapping("/{slug}")
    public PatternService.PatternDetail get(@PathVariable String slug) {
        return patterns.getPatternBySlug(slug);
    }
}

