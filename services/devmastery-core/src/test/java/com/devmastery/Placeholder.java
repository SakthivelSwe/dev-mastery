package com.devmastery;

/**
 * Intentionally no test class here.
 *
 * <p>The previous "context loads" smoke test was misleading because it
 * required excluding so many autoconfigurations (JPA, Flyway, datasource)
 * that it no longer represented a real boot.</p>
 *
 * <p>Real verification happens via:
 * <ul>
 *   <li>{@code ./gradlew compileJava} — proves the module graph compiles.</li>
 *   <li>An integration test suite (Testcontainers + Postgres) that you can add
 *       under {@code src/test/java/com/devmastery/integration/}.</li>
 * </ul></p>
 */
final class Placeholder { private Placeholder() {} }
