package com.devmastery.patterns.internal;

import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.patterns.api.PatternService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
class PatternServiceImpl implements PatternService {

    private final ProblemPatternRepository patterns;
    private final PatternProblemRepository problems;

    PatternServiceImpl(ProblemPatternRepository patterns, PatternProblemRepository problems) {
        this.patterns = patterns;
        this.problems = problems;
    }

    @Override
    public List<PatternSummary> listPatterns() {
        return patterns.findAllByOrderByNameAsc().stream()
                .map(p -> new PatternSummary(
                        p.getId(), p.getSlug(), p.getName(), p.getDescription(),
                        p.getDifficultyLevel(),
                        problems.findByPatternIdOrdered(p.getId()).size()))
                .toList();
    }

    @Override
    public PatternDetail getPatternBySlug(String slug) {
        ProblemPatternEntity p = patterns.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Pattern not found: " + slug));

        List<PatternProblemEntity> all = problems.findByPatternIdOrdered(p.getId());

        int easy = 0, medium = 0, hard = 0;
        for (PatternProblemEntity pp : all) {
            String d = pp.getDifficulty() == null ? "" : pp.getDifficulty().toLowerCase(Locale.ROOT);
            switch (d) {
                case "easy"   -> easy++;
                case "medium" -> medium++;
                case "hard"   -> hard++;
                default       -> { /* unclassified */ }
            }
        }

        List<ProblemView> views = all.stream()
                .map(pp -> new ProblemView(pp.getId(), pp.getTitle(),
                        pp.getDifficulty(), pp.getLeetcodeUrl(), pp.getStarterCode()))
                .toList();

        return new PatternDetail(p.getId(), p.getSlug(), p.getName(), p.getDescription(),
                p.getDifficultyLevel(), easy, medium, hard, views);
    }
}


