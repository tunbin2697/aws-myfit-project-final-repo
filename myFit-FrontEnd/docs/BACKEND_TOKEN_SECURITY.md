# Backend Token Security Implementation Guide

## AWS Cognito & OIDC Best Practices

This guide follows **official AWS and OIDC specifications** for token handling.

---

## Token Purpose (Per OIDC Specification)

| Token | Intended Audience | Purpose |
|-------|-------------------|---------|
| **Access Token** | Resource Server (Backend API) | Authorize API requests |
| **ID Token** | Client Application (Frontend) | Identify the user to the client |
| **Refresh Token** | Authorization Server (Cognito) | Obtain new tokens |

### Key Principle

> **ID Tokens should NEVER be sent to your backend API.**
> 
> — [OIDC Core Spec](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) & [AWS Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

The ID Token's `aud` (audience) claim is your **client application ID**, not your backend. Sending it to your API violates the OIDC specification.

---

## Correct Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Client App)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Receive tokens from Cognito                                      │
│     ├── Access Token  → Store securely, send to backend             │
│     ├── ID Token      → Parse for user info (name, email, picture)  │
│     └── Refresh Token → Store securely, use to refresh tokens       │
│                                                                      │
│  2. For /user/sync:                                                  │
│     - Parse ID Token locally (jwt-decode)                            │
│     - Send user data in REQUEST BODY                                 │
│     - Authorize with ACCESS TOKEN                                    │
│                                                                      │
│  3. For all other APIs:                                              │
│     - Send ACCESS TOKEN in Authorization header                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Resource Server)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. ONLY accept Access Tokens                                        │
│     - Validate token_use === "access"                                │
│     - Reject ID Tokens (token_use === "id")                          │
│                                                                      │
│  2. Get user identity from:                                          │
│     - Access Token's "sub" claim (user ID)                           │
│     - Request body (for sync endpoint)                               │
│     - OR call Cognito UserInfo endpoint                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps (For Your FitMe API)

### Step 1: Update SecurityConfig.java

**File:** `src/main/java/com/example/fitme/config/security/SecurityConfig.java`

```java
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
                        // Public endpoints
                        .requestMatchers("/test/health").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        
                        // Protected endpoints
                        .requestMatchers("/user/sync").authenticated()
                        .requestMatchers("/user/**").authenticated()
                        .requestMatchers("/test/private").authenticated()
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
```

---

### Step 2: Create UserSyncRequestDTO

**File:** `src/main/java/com/example/fitme/module/authentication/dto/UserProfileDTOs/UserSyncRequestDTO.java`

```java
package com.example.fitme.module.authentication.dto.UserProfileDTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user sync request.
 * 
 * Contains user claims extracted from ID Token on the frontend.
 * The frontend parses the ID Token locally and sends these values in the request body.
 * 
 * This follows AWS/OIDC best practices:
 * - ID Token is consumed by the client only
 * - Access Token authorizes the request
 * - User data is sent in the request body
 */
public record UserSyncRequestDTO(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,
    
    String name,
    
    String picture,
    
    // Optional fields that can be extracted from ID token
    String username,
    String birthdate,
    Boolean emailVerified,
    String gender,
    String phoneNumber
) {}
```

---

### Step 3: Update UserProfileController.java

**File:** `src/main/java/com/example/fitme/module/authentication/controller/UserProfileController.java`

```java
package com.example.fitme.module.authentication.controller;

import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileResponseDTO;
import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileUpdateRequestDTO;
import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserSyncRequestDTO;
import com.example.fitme.module.authentication.service.UserProfileService.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;

    /**
     * Sync user profile from frontend.
     * 
     * AWS/OIDC Best Practice:
     * - Access Token: Used for authorization (validated by Spring Security)
     * - User data: Received in request body (extracted from ID Token on frontend)
     * 
     * The frontend parses the ID Token locally using jwt-decode,
     * then sends the user claims in the request body.
     * 
     * @param accessToken The Access Token (injected by Spring Security, already validated as token_use="access")
     * @param request User data extracted from ID Token on frontend
     * @return User profile after sync
     */
    @PostMapping("/sync")
    public UserProfileResponseDTO syncUser(
            @AuthenticationPrincipal Jwt accessToken,
            @Valid @RequestBody UserSyncRequestDTO request) {
        
        // Get cognitoId from Access Token's "sub" claim
        // Both Access Token and ID Token have the same "sub" value
        String cognitoSub = accessToken.getSubject();
        
        // User info comes from request body (extracted from ID Token on frontend)
        return userProfileService.syncUser(
                cognitoSub,
                request.email(),
                request.username(),
                request.birthdate(),
                request.emailVerified(),
                request.gender(),
                request.name(),
                request.phoneNumber(),
                request.picture()
        );
    }

    @GetMapping("/{id}")
    public UserProfileResponseDTO getById(@PathVariable UUID id) {
        return userProfileService.getUserProfileById(id);
    }

    @PutMapping("/{id}")
    public UserProfileResponseDTO update(@PathVariable UUID id, @RequestBody UserProfileUpdateRequestDTO request) {
        return userProfileService.updateUserProfile(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userProfileService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Token Claim Reference

### Access Token (What Backend Receives)
```json
{
  "sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "token_use": "access",
  "scope": "openid profile email",
  "auth_time": 1707312000,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_9AoKPqZO1",
  "exp": 1707315600,
  "iat": 1707312000,
  "client_id": "661fm3mj7s5qcmoldri1mem9sr",
  "username": "google_123456789",
  "cognito:groups": ["USER", "ADMIN"]
}
```

### ID Token (Frontend Only - Never Send to Backend)
```json
{
  "sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "token_use": "id",
  "aud": "661fm3mj7s5qcmoldri1mem9sr",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "email_verified": true,
  "birthdate": "1990-01-15",
  "gender": "male",
  "phone_number": "+1234567890",
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_9AoKPqZO1",
  "exp": 1707315600,
  "iat": 1707312000
}
```

**Note:** Both tokens have the same `sub` claim, so you can identify users with just the Access Token.

---

## Frontend Changes (Already Done)

The `authService.ts` has been updated to:

```typescript
// Parse ID Token locally
const decodedIdToken = jwtDecode<IdTokenPayload>(idToken);

// Send user data in request body, Access Token added by interceptor
const response = await api.post('/user/sync', {
    email: decodedIdToken.email,
    name: decodedIdToken.name || '',
    picture: decodedIdToken.picture || '',
});
```

---

## API Endpoint Summary

| Endpoint | Authorization | Request Body | Notes |
|----------|---------------|--------------|-------|
| `POST /user/sync` | Access Token | `UserSyncRequestDTO` | User info from ID Token |
| `GET /user/{id}` | Access Token | - | Get user by ID |
| `PUT /user/{id}` | Access Token | `UserProfileUpdateRequestDTO` | Update user |
| `DELETE /user/{id}` | Access Token | - | Delete user |
| `GET /api/body-metrics/**` | Access Token | - | Body metrics endpoints |
| `GET /api/goal-types/**` | Access Token | - | Goal type endpoints |

---

## Error Responses

### ID Token Sent (Rejected at JWT Decoder Level)
```json
{
  "timestamp": "2026-02-07T12:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Only access tokens are accepted. Received: id",
  "path": "/user/sync"
}
```

### No Token / Invalid Token
```json
{
  "timestamp": "2026-02-07T12:00:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/user/sync"
}
```

---

## Testing

### ✅ Access Token (Should Work)
```bash
curl -X POST http://localhost:8080/user/sync \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://example.com/photo.jpg"
  }'
```

### ❌ ID Token (Should Fail with 401)
```bash
curl -X POST http://localhost:8080/user/sync \
  -H "Authorization: Bearer {ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
# Expected: 401 Unauthorized - "Only access tokens are accepted. Received: id"
```

---

## Why This Approach?

| Aspect | Previous (Workaround) | Correct (AWS Best Practice) |
|--------|----------------------|----------------------------|
| ID Token to backend | ✅ Allowed, extracted claims | ❌ Rejected at JWT decoder level |
| User info source | Extracted from JWT on backend | Sent in request body from frontend |
| OIDC Compliance | ❌ Violates spec | ✅ Fully compliant |
| Security | ID Token expands attack surface | Single token type = smaller surface |
| Backend Code | Custom extraction logic | Standard `@RequestBody` pattern |

---

## Summary of Changes

### Files to Modify:

1. **`SecurityConfig.java`** - Add `jwtDecoder()` bean with token_use validation
2. **`UserProfileController.java`** - Change from extracting JWT claims to `@RequestBody`

### Files to Create:

1. **`UserSyncRequestDTO.java`** - Request body DTO for /user/sync

### No Changes Needed:

- `UserProfileService.java` - Interface stays the same
- `UserProfileServiceImpl.java` - Implementation stays the same
- `UserProfile.java` - Entity stays the same

---

## References

- [AWS: Verifying a JSON Web Token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)
- [AWS: Using Tokens with User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)
- [OIDC Core Specification - ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
- [OAuth 2.0 Access Token](https://datatracker.ietf.org/doc/html/rfc6749#section-1.4)
