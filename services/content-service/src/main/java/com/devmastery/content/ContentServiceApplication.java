package com.devmastery.content;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;

/**
 * DevMastery Content Service
 *
 * Serves: Learning Paths, Topics, Lessons, Code Examples
 * Port: 8082
 * Cache: Valkey 7.x (via spring-data-redis — identical protocol)
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableFeignClients
public class ContentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContentServiceApplication.class, args);
    }

    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }
}
