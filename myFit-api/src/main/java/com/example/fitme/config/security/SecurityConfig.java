package com.example.fitme.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.core.convert.converter.Converter;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (Login/Register is handled by Cognito directly now)
                        .requestMatchers("/test/private").authenticated()
                        .requestMatchers("/test/health").permitAll()
                        
                        // Protected endpoints
                        .requestMatchers("/user/sync").authenticated() 
                        .requestMatchers("/user/**").authenticated()
                        .requestMatchers("/api/metrics/**").authenticated()
                        .requestMatchers("/api/goal-types/**").authenticated()
                        .requestMatchers("/api/body-metrics/**").authenticated()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }

    /**
     * AWS Best Practice: Only accept Access Tokens
     * 
     * ID Tokens have token_use="id" and should NEVER be sent to the backend.
     * Access Tokens have token_use="access" and are the only valid tokens for API calls.
     * 
     * @see <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html">AWS Cognito Token Verification</a>
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withIssuerLocation(issuerUri)
                .build();

        // Custom validator to reject ID tokens
        OAuth2TokenValidator<Jwt> accessTokenOnlyValidator = token -> {
            String tokenUse = token.getClaimAsString("token_use");
            
            if (!"access".equals(tokenUse)) {
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error(
                                "invalid_token",
                                "Only access tokens are accepted. Received: " + tokenUse,
                                null
                        )
                );
            }
            
            return OAuth2TokenValidatorResult.success();
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuerUri),
                accessTokenOnlyValidator
        ));

        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new Converter<Jwt, Collection<GrantedAuthority>>() {
            @Override
            public Collection<GrantedAuthority> convert(Jwt jwt) {
                List<String> groups = jwt.getClaimAsStringList("cognito:groups");
                if (groups == null) {
                    return List.of();
                }
                return groups.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toList());
            }
        });
        return converter;
    }
}
