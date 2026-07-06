package com.devmastery.ai.internal;

import com.devmastery.ai.api.InterviewService.ScoreCard;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InterviewScorecardParserTest {

    private static final String CANONICAL = """
            1) Overall verdict: **Lean Yes**

            2) Scores (1-10):
            - Technical depth: 7/10
            - Communication: 8/10
            - Problem solving: 6/10
            - Seniority signals: 5/10

            3) Strengths:
            - Strong grasp of HashMap internals
            - Explained rehashing clearly

            4) Improvements:
            - Deepen concurrency knowledge
            - Practice complexity analysis
            """;

    @Test
    void parsesCanonicalScorecard() {
        ScoreCard card = InterviewScorecardParser.parse(CANONICAL);

        assertThat(card.verdict()).isEqualTo("lean_yes");
        assertThat(card.technical()).isEqualTo(7);
        assertThat(card.communication()).isEqualTo(8);
        assertThat(card.problemSolving()).isEqualTo(6);
        assertThat(card.seniority()).isEqualTo(5);
        assertThat(card.strengths()).hasSize(2)
                .anyMatch(s -> s.contains("HashMap internals"))
                .anyMatch(s -> s.contains("rehashing"));
        assertThat(card.improvements()).hasSize(2)
                .anyMatch(s -> s.contains("concurrency"))
                .anyMatch(s -> s.contains("complexity"));
    }

    @Test
    void mapsAllVerdictAliases() {
        assertThat(InterviewScorecardParser.parse("Verdict: Strong Hire").verdict()).isEqualTo("strong_hire");
        assertThat(InterviewScorecardParser.parse("verdict: lean yes").verdict()).isEqualTo("lean_yes");
        assertThat(InterviewScorecardParser.parse("Verdict: lean-no").verdict()).isEqualTo("lean_no");
        assertThat(InterviewScorecardParser.parse("Verdict: NO HIRE").verdict()).isEqualTo("reject");
        assertThat(InterviewScorecardParser.parse("no verdict word here").verdict()).isEqualTo("pending");
    }

    @Test
    void handlesEmptyAndBlankInput() {
        ScoreCard c1 = InterviewScorecardParser.parse(null);
        ScoreCard c2 = InterviewScorecardParser.parse("   \n   ");
        for (ScoreCard c : new ScoreCard[]{ c1, c2 }) {
            assertThat(c.verdict()).isEqualTo("pending");
            assertThat(c.technical()).isZero();
            assertThat(c.strengths()).isEmpty();
            assertThat(c.improvements()).isEmpty();
        }
    }

    @Test
    void tolerantOfMissingDimensionsAndClampsScores() {
        ScoreCard card = InterviewScorecardParser.parse("""
                Verdict: strong hire
                Technical: 12
                Communication: 8
                """);
        assertThat(card.verdict()).isEqualTo("strong_hire");
        // 12 was clamped to 10.
        assertThat(card.technical()).isEqualTo(10);
        assertThat(card.communication()).isEqualTo(8);
        // Missing dimensions default to 0.
        assertThat(card.problemSolving()).isZero();
        assertThat(card.seniority()).isZero();
    }

    @Test
    void parsesStrengthsSectionWithBoldLabels() {
        ScoreCard card = InterviewScorecardParser.parse("""
                Verdict: lean yes

                Strengths:
                - **Depth**: Explained V8 hidden classes
                - **Clarity**: Whiteboarded the algorithm cleanly

                Improvements:
                - Missed the edge case for empty arrays
                """);
        assertThat(card.strengths()).hasSize(2)
                .anyMatch(s -> s.contains("Depth"))
                .anyMatch(s -> s.contains("Clarity"));
        assertThat(card.improvements()).hasSize(1)
                .allMatch(s -> s.contains("empty arrays"));
    }
}

