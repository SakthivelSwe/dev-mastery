plugins {
    java
    id("org.springframework.boot") version "3.2.5"
    id("io.spring.dependency-management") version "1.1.5"
    id("io.freefair.lombok") version "8.6"
}

group = "com.devmastery"
version = "0.1.0-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // ─── Spring Boot Core ─────────────────────────────────────
    implementation("org.springframework.boot:spring-boot-starter-webflux")

    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-cache")

    // ─── Valkey / Redis Cache (spring-data-redis works with Valkey) ──
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("io.lettuce:lettuce-core")  // reactive Valkey client

    // ─── Database ─────────────────────────────────────────────
    // Removed DB dependencies since we use REST to talk to content-service

    // ─── Caffeine L1 In-Process Cache ─────────────────────────
    implementation("com.github.ben-manes.caffeine:caffeine")

    // ─── MapStruct (compile-time DTO mapper) ──────────────────
    implementation("org.mapstruct:mapstruct:1.5.5.Final")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.5.5.Final")

    // ─── Lombok ───────────────────────────────────────────────
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

    // ─── JWT (for validating tokens from auth-service) ────────
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")

    // ─── OpenAPI / Swagger UI ─────────────────────────────────
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.5.0")

    // ─── Metrics ──────────────────────────────────────────────
    runtimeOnly("io.micrometer:micrometer-registry-prometheus")

    // ─── Testing ──────────────────────────────────────────────
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("com.redis:testcontainers-redis")
    testImplementation("io.rest-assured:rest-assured:5.4.0")
}

dependencyManagement {
    imports {
        mavenBom("org.testcontainers:testcontainers-bom:1.19.8")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
    jvmArgs("-XX:+EnableDynamicAgentLoading")  // suppress Java 21 warnings
}

tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    args("--spring.profiles.active=dev")
}
