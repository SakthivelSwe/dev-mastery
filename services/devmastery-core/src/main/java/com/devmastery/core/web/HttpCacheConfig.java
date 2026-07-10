package com.devmastery.core.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Adds HTTP {@code Cache-Control} headers to safe, read-heavy GET endpoints so
 * that browsers, the Android OkHttp cache, and any downstream CDN can skip the
 * network round-trip entirely for content that changes rarely.
 *
 * <p>Chosen carefully:
 * <ul>
 *   <li>Only pure {@code GET} responses.</li>
 *   <li>Only paths without a per-user component (roadmap/profile/review/etc.
 *       remain uncached).</li>
 *   <li>Uses {@code stale-while-revalidate} so users still see instant loads
 *       when a fresh copy is being fetched in the background.</li>
 *   <li>Explicitly {@code no-store} on any {@code /auth/**} response so we
 *       never let a cache hold a token or the "who am I" reply.</li>
 * </ul>
 * The backend still has its Caffeine cache in front of the DB, so the win here
 * is one fewer HTTP round-trip on the client — huge on Render's cold-starting
 * free tier.
 */
@Configuration
public class HttpCacheConfig implements WebMvcConfigurer {

    private static final String CACHE_LONG_SWR  =
            "public, max-age=600, stale-while-revalidate=3600"; // 10m fresh / 1h SWR
    private static final String CACHE_MED_SWR   =
            "public, max-age=120, stale-while-revalidate=600";  // 2m fresh / 10m SWR

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public void postHandle(HttpServletRequest req, HttpServletResponse res,
                                   Object handler, org.springframework.web.servlet.ModelAndView mv) {
                if (!"GET".equalsIgnoreCase(req.getMethod())) return;
                if (res.containsHeader("Cache-Control")) return;   // don't clobber explicit headers

                String path = req.getRequestURI();
                if (path == null) return;

                // Sensitive — never cache.
                if (path.startsWith("/v1/auth") || path.startsWith("/v1/profile")
                        || path.startsWith("/v1/progress") || path.startsWith("/v1/interviews")
                        || path.startsWith("/v1/certificates") || path.startsWith("/v1/ai")) {
                    res.setHeader("Cache-Control", "no-store");
                    return;
                }

                // Very cache-friendly (public content that changes rarely).
                if (path.equals("/v1/paths")
                        || path.startsWith("/v1/paths/")     // path + roadmap-less overview
                        || path.startsWith("/v1/topics/")    // /topics/{slug} + /lessons
                        || path.startsWith("/v1/patterns")
                        || path.startsWith("/v1/system-design")) {
                    // Roadmap is per-user — exclude explicitly.
                    if (path.endsWith("/roadmap")) {
                        res.setHeader("Cache-Control", "private, max-age=30");
                    } else {
                        res.setHeader("Cache-Control", CACHE_LONG_SWR);
                    }
                    return;
                }

                // Search / list — a bit fresher but still cacheable.
                if (path.startsWith("/v1/search") || path.equals("/v1/topics")) {
                    res.setHeader("Cache-Control", CACHE_MED_SWR);
                }
            }
        }).addPathPatterns("/v1/**");
    }
}

