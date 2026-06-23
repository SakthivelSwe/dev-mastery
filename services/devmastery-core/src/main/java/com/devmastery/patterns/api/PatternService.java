package com.devmastery.patterns.api;

import java.util.List;
import java.util.UUID;

/** Public contract for the LeetCode-style patterns catalogue. */
public interface PatternService {

    List<PatternSummary> listPatterns();

    PatternDetail getPatternBySlug(String slug);

    record PatternSummary(UUID id, String slug, String name, String description,
                          String difficultyLevel, int problemCount) { }

    record PatternDetail(UUID id, String slug, String name, String description,
                         String difficultyLevel,
                         int easyCount, int mediumCount, int hardCount,
                         List<ProblemView> problems) { }

    record ProblemView(UUID id, String title, String difficulty,
                       String leetcodeUrl, String starterCode) { }
}


