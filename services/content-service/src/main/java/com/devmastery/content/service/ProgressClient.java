package com.devmastery.content.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "progress-service", url = "${progress-service.url:http://localhost:8083}")
public interface ProgressClient {

    @GetMapping("/v1/internal/progress/{userId}/path/{pathSlug}")
    Map<String, Boolean> getPathProgress(@PathVariable("userId") UUID userId, @PathVariable("pathSlug") String pathSlug);

}
