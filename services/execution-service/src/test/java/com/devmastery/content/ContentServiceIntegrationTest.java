package com.devmastery.content;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for content-service.
 * Uses Testcontainers: real PostgreSQL + real Valkey (via Redis image).
 * No mocks — tests against actual database with seeded Flyway data.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ContentServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("devmastery")
            .withUsername("devmastery")
            .withPassword("devmastery_test");

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> valkey = new GenericContainer<>(
            DockerImageName.parse("valkey/valkey:7-alpine").asCompatibleSubstituteFor("redis"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", valkey::getHost);
        registry.add("spring.data.redis.port", () -> valkey.getMappedPort(6379));
    }

    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "";
    }

    // ─── Learning Paths ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /v1/paths → returns 7 seeded learning paths")
    void getAllPaths_returnsSeededPaths() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/v1/paths")
        .then()
            .statusCode(200)
            .body("$", hasSize(7))
            .body("[0].slug", equalTo("java-mastery"))
            .body("[0].title", equalTo("Java Mastery"))
            .body("[0].accentColor", equalTo("#F89820"))
            .body("[0].isActive", equalTo(true))
            .body("[1].slug", equalTo("dsa-mastery"))
            .body("[6].slug", equalTo("interview-preparation"));
    }

    @Test
    @DisplayName("GET /v1/paths/java-mastery → returns path detail")
    void getPath_bySlug_returnsDetail() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/v1/paths/java-mastery")
        .then()
            .statusCode(200)
            .body("slug", equalTo("java-mastery"))
            .body("levelMin", equalTo(1))
            .body("levelMax", equalTo(5))
            .body("orderIndex", equalTo(1));
    }

    @Test
    @DisplayName("GET /v1/paths/nonexistent → 404 NOT_FOUND")
    void getPath_nonExistent_returns404() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/v1/paths/this-path-does-not-exist")
        .then()
            .statusCode(404)
            .body("error", equalTo("PATH_NOT_FOUND"))
            .body("message", containsString("this-path-does-not-exist"))
            .body("timestamp", notNullValue());
    }

    // ─── Topics ─────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /v1/topics → 200 with empty page (no topics seeded yet)")
    void getTopics_returnsEmptyPage() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/v1/topics")
        .then()
            .statusCode(200)
            .body("content", hasSize(0))
            .body("totalElements", equalTo(0));
    }

    @Test
    @DisplayName("GET /v1/topics/nonexistent → 404 TOPIC_NOT_FOUND")
    void getTopic_nonExistent_returns404() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/v1/topics/nonexistent-topic")
        .then()
            .statusCode(404)
            .body("error", equalTo("TOPIC_NOT_FOUND"))
            .body("timestamp", notNullValue());
    }

    // ─── Actuator ────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /actuator/health → UP")
    void actuatorHealth_returnsUp() {
        given()
        .when()
            .get("/actuator/health")
        .then()
            .statusCode(200)
            .body("status", equalTo("UP"));
    }
}
