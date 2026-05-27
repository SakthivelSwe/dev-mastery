package com.devmastery.content;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * DevMastery Content Service
 *
 * Serves: Learning Paths, Topics, Lessons, Code Examples
 * Port: 8082
 * Cache: Valkey 7.x (via spring-data-redis — identical protocol)
 * DB: PostgreSQL 16 (schema managed by Flyway)
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableFeignClients
public class ContentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContentServiceApplication.class, args);
    }
}
