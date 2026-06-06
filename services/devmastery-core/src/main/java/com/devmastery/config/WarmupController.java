package com.devmastery.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.Map;

/**
 * Warmup endpoint for UptimeRobot keep-alive pings.
 *
 * <p>Serves two purposes:
 * <ol>
 *   <li>Prevents Render free tier from spinning down (ping every 14 min)</li>
 *   <li>Executes a lightweight DB query to keep Supabase project active
 *       (Supabase pauses after 7 days without DB activity)</li>
 * </ol></p>
 */
@RestController
class WarmupController {

    private final DataSource dataSource;

    WarmupController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/api/warmup")
    public Map<String, Object> warmup() {
        // Lightweight DB ping — keeps Supabase from pausing
        try (Connection conn = dataSource.getConnection();
             ResultSet rs = conn.createStatement().executeQuery("SELECT 1")) {
            rs.next();
        } catch (Exception e) {
            return Map.of("status", "degraded", "db", false, "error", e.getMessage());
        }
        return Map.of("status", "ok", "db", true);
    }
}
