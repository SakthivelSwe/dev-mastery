package com.devmastery.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI devMasteryOpenApi() {
        return new OpenAPI().info(new Info()
                .title("DevMastery Core API")
                .version("1.0.0")
                .description("Modular monolith API — auth, content, progress, quiz, search, AI."));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder().group("public").pathsToMatch("/v1/**").build();
    }
}
