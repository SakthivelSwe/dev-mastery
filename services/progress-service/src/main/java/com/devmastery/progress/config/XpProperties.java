package com.devmastery.progress.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "xp")
@Getter
@Setter
public class XpProperties {
    private Map<String, Integer> levelMultipliers = new HashMap<>();
}
