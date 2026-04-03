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
