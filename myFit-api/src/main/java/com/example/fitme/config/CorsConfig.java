package com.example.fitme.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:*,http://127.0.0.1:*}")
    private String corsAllowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // This API uses bearer tokens, not cookie-based auth.
        config.setAllowCredentials(false);

        List<String> allowedOrigins = new ArrayList<>(Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        allowedOrigins.add("https://*.cloudfront.net");
        config.setAllowedOriginPatterns(allowedOrigins.stream().distinct().toList());

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/auth/**", config);
        source.registerCorsConfiguration("/user/**", config);

        return new CorsFilter(source);
    }
}
