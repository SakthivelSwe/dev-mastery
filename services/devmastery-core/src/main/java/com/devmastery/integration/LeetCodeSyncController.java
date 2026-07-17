package com.devmastery.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * LeetCode Auto-Sync: fetches a user's solved problems from the
 * public LeetCode GraphQL API (no API key required, public profiles only)
 * and awards XP for any matched DevMastery pattern problems.
 */
@RestController
@RequestMapping("/v1/leetcode")
public class LeetCodeSyncController {

    private static final Logger log = LoggerFactory.getLogger(LeetCodeSyncController.class);
    private static final String LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

    private final JdbcTemplate jdbc;
    private final RestTemplate http;

    public LeetCodeSyncController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.http = new RestTemplate();
    }

    // ─── DTO ──────────────────────────────────────────────────────────────────

    public record SetUsernameRequest(String leetcodeUsername) {}

    public record SyncResult(
            int totalSolved,
            int newlySynced,
            int xpAwarded,
            List<String> newlySyncedTitles
    ) {}

    // ─── Set LeetCode username ─────────────────────────────────────────────────

    @PutMapping("/username")
    public ResponseEntity<Map<String, String>> setUsername(
            Authentication auth,
            @RequestBody SetUsernameRequest req) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = auth.getName();
        jdbc.update(
                "UPDATE users SET leetcode_username = ? WHERE email = ?",
                req.leetcodeUsername(), email);
        log.info("Set LeetCode username '{}' for user '{}'", req.leetcodeUsername(), email);
        return ResponseEntity.ok(Map.of("leetcodeUsername", req.leetcodeUsername()));
    }

    @GetMapping("/username")
    public ResponseEntity<Map<String, String>> getUsername(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = auth.getName();
        String username = jdbc.queryForObject(
                "SELECT leetcode_username FROM users WHERE email = ?",
                String.class, email);
        return ResponseEntity.ok(Map.of("leetcodeUsername", username == null ? "" : username));
    }

    // ─── Sync solved problems ─────────────────────────────────────────────────

    @PostMapping("/sync")
    public ResponseEntity<SyncResult> sync(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = auth.getName();

        // Get user id and leetcodeUsername
        Map<String, Object> user;
        try {
            user = jdbc.queryForMap(
                    "SELECT id::text AS id, leetcode_username FROM users WHERE email = ?",
                    email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String lcUsername = (String) user.get("leetcode_username");
        String userId = (String) user.get("id");
        if (lcUsername == null || lcUsername.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Fetch solved problems from LeetCode public GraphQL
        List<String> solvedTitles = fetchLeetCodeSolvedTitles(lcUsername);
        if (solvedTitles == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new SyncResult(0, 0, 0, List.of()));
        }

        // Match against our pattern_problems by title
        // and insert new solves + award XP
        int newlySynced = 0;
        int totalXp = 0;
        List<String> newlySyncedTitles = new ArrayList<>();

        for (String title : solvedTitles) {
            // Check if we already tracked this
            Integer exists = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM leetcode_solved_problems WHERE user_id = ?::uuid AND problem_title = ?",
                    Integer.class, userId, title);
            if (exists != null && exists > 0) continue;

            // Find matching pattern problem
            List<Map<String, Object>> matches = jdbc.queryForList(
                    "SELECT id::text, difficulty, COALESCE(xp_value, 10) AS xp_value FROM pattern_problems WHERE LOWER(title) = LOWER(?)",
                    title);

            int xp = 0;
            String ppId = null;
            String difficulty = null;
            if (!matches.isEmpty()) {
                Map<String, Object> pp = matches.get(0);
                ppId = (String) pp.get("id");
                difficulty = (String) pp.get("difficulty");
                xp = ((Number) pp.get("xp_value")).intValue();
            }

            // Insert solved record
            jdbc.update("""
                INSERT INTO leetcode_solved_problems
                    (user_id, problem_title, difficulty, xp_awarded, pattern_problem_id)
                VALUES (?::uuid, ?, ?, ?, ?::uuid)
                ON CONFLICT (user_id, problem_title) DO NOTHING
                """, userId, title, difficulty, xp, ppId);

            if (xp > 0) {
                // Award XP via user_xp_events (same table used by topic completions)
                jdbc.update("""
                    INSERT INTO user_xp_events (user_id, event_type, xp_amount, reference_id)
                    VALUES (?::uuid, 'leetcode_solved', ?, ?::uuid)
                    ON CONFLICT DO NOTHING
                    """, userId, xp, ppId != null ? ppId : "00000000-0000-0000-0000-000000000000");
                totalXp += xp;
            }

            newlySynced++;
            newlySyncedTitles.add(title);
        }

        log.info("LeetCode sync for '{}': {} new solves, {} XP awarded", lcUsername, newlySynced, totalXp);
        return ResponseEntity.ok(new SyncResult(solvedTitles.size(), newlySynced, totalXp, newlySyncedTitles));
    }

    // ─── Get sync status (for display in UI) ─────────────────────────────────

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = auth.getName();
        Map<String, Object> user = jdbc.queryForMap(
                "SELECT id::text AS id, leetcode_username FROM users WHERE email = ?", email);

        String userId = (String) user.get("id");
        int totalSynced = jdbc.queryForObject(
                "SELECT COUNT(*) FROM leetcode_solved_problems WHERE user_id = ?::uuid",
                Integer.class, userId);
        int totalXp = jdbc.queryForObject(
                "SELECT COALESCE(SUM(xp_awarded), 0) FROM leetcode_solved_problems WHERE user_id = ?::uuid",
                Integer.class, userId);

        return ResponseEntity.ok(Map.of(
                "leetcodeUsername", user.getOrDefault("leetcode_username", ""),
                "totalSynced", totalSynced,
                "totalXpFromLeetCode", totalXp
        ));
    }

    // ─── LeetCode public GraphQL call ─────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<String> fetchLeetCodeSolvedTitles(String username) {
        String query = """
            {
              "query": "query userSolvedProblems($username: String!) { allQuestionsCount { difficulty count } matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } problemsSolvedBeatsStats { difficulty percentage } } recentAcSubmissionList(username: $username, limit: 50) { id title titleSlug timestamp } }",
              "variables": { "username": "%s" }
            }
            """.formatted(username);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Referer", "https://leetcode.com");
        headers.set("User-Agent", "Mozilla/5.0 DevMastery-Sync/1.0");

        HttpEntity<String> entity = new HttpEntity<>(query, headers);
        try {
            ResponseEntity<Map> resp = http.postForEntity(LEETCODE_GRAPHQL, entity, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return null;

            Map<String, Object> data = (Map<String, Object>) resp.getBody().get("data");
            if (data == null) return null;

            List<Map<String, Object>> recent = (List<Map<String, Object>>)
                    data.get("recentAcSubmissionList");
            if (recent == null) return List.of();

            return recent.stream()
                    .map(s -> (String) s.get("title"))
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();
        } catch (Exception ex) {
            log.warn("Failed to fetch LeetCode data for '{}': {}", username, ex.getMessage());
            return null;
        }
    }
}
