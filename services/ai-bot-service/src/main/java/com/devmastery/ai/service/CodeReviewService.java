package com.devmastery.ai.service;

import com.devmastery.ai.dto.CodeReviewRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeReviewService {

    public Flux<String> streamCodeReview(CodeReviewRequest request) {
        log.info("Starting AI code review for topic: {} in language: {}", request.getTopicSlug(), request.getLanguage());
        
        String[] mockResponse = {
            "### AI Code Review\n\n",
            "**Time Complexity:** O(n)\n",
            "**Space Complexity:** O(1)\n\n",
            "#### Feedback:\n",
            "- Your approach using two pointers is optimal for this problem.\n",
            "- **Tip:** Consider checking for null or empty array at the beginning of the function to prevent edge-case errors.\n",
            "- Variables are named well, making the code readable.\n\n",
            "Great job! Keep up the good work."
        };

        return Flux.fromStream(Stream.of(mockResponse))
                   .delayElements(Duration.ofMillis(300));
    }
}
