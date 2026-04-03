package com.example.fitme.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for AWS Bedrock HTTP client.
 * Uses RestTemplate to call Bedrock REST API with API key authentication.
 */
@Configuration
public class BedrockConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
