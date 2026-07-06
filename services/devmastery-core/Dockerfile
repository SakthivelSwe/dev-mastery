# =============================================================
# DevMastery Core — multi-stage build optimised for Render free tier (512MB RAM)
# Final image ≈ 200 MB (eclipse-temurin:21-jre-alpine).
# =============================================================

# ---------- Stage 1: build ----------
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy gradle wrapper + build files first for layer caching
COPY gradlew settings.gradle.kts build.gradle.kts gradle.properties ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# Now copy sources and build
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# ---------- Stage 2: runtime ----------
# JDK (not JRE) so we can compile & run user-submitted Java code via `javac` / `java`.
# The +150 MB is worth it — it removes the need for any external code-execution service.
FROM eclipse-temurin:21-jdk-alpine AS runtime
WORKDIR /app

# Install curl for healthcheck. `javac` / `java` come with the JDK image.
RUN apk add --no-cache curl && \
    addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder /workspace/build/libs/devmastery-core.jar app.jar

# JVM flags optimised for Render free tier (512MB RAM cap)
ENV JAVA_OPTS="-Xmx350m -Xms128m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
