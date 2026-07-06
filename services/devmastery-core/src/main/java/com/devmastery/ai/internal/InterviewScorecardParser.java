package com.devmastery.ai.internal;

import com.devmastery.ai.api.InterviewService.ScoreCard;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses the AI interviewer's final scorecard message into a structured
 * {@link ScoreCard}. Rule-based (regex + heuristics) so we don't burn a
 * second Gemini call per session.
 *
 * <p>Expected shape — matches the prompt in {@code InterviewPage}:</p>
 * <pre>
 *  1) Overall verdict: **Lean Yes**
 *  2) Scores 1-10:
 *  - Technical depth: 7/10
 *  - Communication: 8/10
 *  - Problem solving: 6/10
 *  - Seniority signals: 5/10
 *  3) Strengths:
 *  - Strong grasp of HashMap internals
 *  - Explained rehashing clearly
 *  4) Improvements:
 *  - Deepen concurrency knowledge
 *  - Practice complexity analysis
 * </pre>
 *
 * <p>Missing fields default to sensible values (verdict="pending", score=0,
 * empty lists) instead of throwing — the frontend can still display the raw
 * markdown as fallback.</p>
 */
final class InterviewScorecardParser {

    private InterviewScorecardParser() { /* util */ }

    // ─── Verdicts (case-insensitive, matches longest first) ─────────
    private static final String[][] VERDICT_ALIASES = {
            {"strong_hire",  "strong hire", "strong-hire"},
            {"lean_yes",     "lean yes",    "lean-yes"},
            {"lean_no",      "lean no",     "lean-no"},
            {"reject",       "no hire",     "no-hire", "do not hire", "reject"},
    };

    // ─── Dimension keys → regex fragments that match their labels ──
    private static final Pattern TECHNICAL       = Pattern.compile("(?i)(technical(?:\\s+depth)?|depth)");
    private static final Pattern COMMUNICATION   = Pattern.compile("(?i)communication");
    private static final Pattern PROBLEM_SOLVING = Pattern.compile("(?i)problem[\\-\\s]?solving");
    private static final Pattern SENIORITY       = Pattern.compile("(?i)seniority(?:\\s+signals)?|senior[\\-\\s]?level");

    // A score line looks like:  "- Technical depth: 7/10"  or  "Technical: 7"
    private static final Pattern SCORE_LINE =
            Pattern.compile("(?i)([A-Za-z][A-Za-z\\-\\s]{2,40}?)\\s*[:\\-–]\\s*(\\d{1,2})(?:\\s*/\\s*10)?");

    static ScoreCard parse(String markdown) {
        if (markdown == null || markdown.isBlank()) {
            return new ScoreCard("pending", 0, 0, 0, 0, List.of(), List.of());
        }

        String verdict = findVerdict(markdown);

        int technical = 0, communication = 0, problemSolving = 0, seniority = 0;
        for (String line : markdown.split("\\r?\\n")) {
            Matcher m = SCORE_LINE.matcher(line);
            while (m.find()) {
                String label = m.group(1).trim();
                int val = clamp(Integer.parseInt(m.group(2)));
                if (val == 0) continue;
                if      (TECHNICAL.matcher(label).find()       && technical == 0)      technical = val;
                else if (COMMUNICATION.matcher(label).find()   && communication == 0)  communication = val;
                else if (PROBLEM_SOLVING.matcher(label).find() && problemSolving == 0) problemSolving = val;
                else if (SENIORITY.matcher(label).find()       && seniority == 0)      seniority = val;
            }
        }

        List<String> strengths    = extractBulletsAfter(markdown, "strengths?");
        List<String> improvements = extractBulletsAfter(markdown, "improvements?|areas? to improve|weaknesses?");

        return new ScoreCard(verdict, technical, communication, problemSolving, seniority,
                strengths, improvements);
    }

    // ─── Helpers ───────────────────────────────────────────────────

    private static String findVerdict(String md) {
        String lower = md.toLowerCase();
        for (String[] group : VERDICT_ALIASES) {
            String canonical = group[0];
            for (int i = 1; i < group.length; i++) {
                if (lower.contains(group[i])) return canonical;
            }
        }
        return "pending";
    }

    /**
     * Collect bullet items appearing under a "Strengths:" or similar header,
     * stopping at the next numbered heading, blank line + heading, or when
     * bullets stop. Cleans up leading markers (- * • 1.) and bold.
     */
    private static List<String> extractBulletsAfter(String md, String headerPattern) {
        Pattern header = Pattern.compile("(?i)(?m)^\\s*(?:\\d+\\)|\\d+\\.|\\*\\*|#+)?\\s*(?:" + headerPattern + ")\\s*[:\\-–].*$");
        Matcher m = header.matcher(md);
        if (!m.find()) return List.of();

        String tail = md.substring(m.end());
        List<String> out = new ArrayList<>();
        for (String raw : tail.split("\\r?\\n")) {
            String line = raw.trim();
            if (line.isEmpty()) {
                if (!out.isEmpty()) break;   // blank line ends the section (unless first)
                continue;
            }
            // Stop at the next section header (numbered or bold).
            if (line.matches("(?i)\\d+[\\)\\.].*") || line.matches("\\*\\*.*\\*\\*.*") || line.startsWith("##")) {
                if (!out.isEmpty()) break;
            }
            if (line.matches("^[\\-\\*•]\\s+.+")) {
                out.add(cleanBullet(line));
            } else if (out.isEmpty()) {
                // No bullet marker — try to accept a lone sentence as one strength.
                if (line.length() < 200) out.add(cleanBullet(line));
            } else {
                break;
            }
            if (out.size() >= 5) break;      // sanity cap
        }
        return out;
    }

    private static String cleanBullet(String s) {
        return s.replaceFirst("^[\\-\\*•]\\s*", "")
                .replaceAll("^\\*\\*(.+?)\\*\\*\\s*[:\\-–]?\\s*", "$1: ")
                .replaceAll("\\*\\*", "")
                .trim();
    }

    private static int clamp(int v) { return v < 0 ? 0 : Math.min(v, 10); }
}

