package com.example.fitme.module.testing_template.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    /**
     * Admin-only endpoint - requires ADMIN role
     * Tests @PreAuthorize with hasRole
     */
    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminOnlyEndpoint(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome Admin! You have access to admin-only resources.");
        response.put("username", jwt.getClaimAsString("username"));
        response.put("groups", jwt.getClaimAsStringList("cognito:groups"));
        return ResponseEntity.ok(response);
    }

    /**
     * Admin-only endpoint - alternative syntax using hasAuthority
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> adminDashboard(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin Dashboard Data");
        response.put("adminUser", jwt.getClaimAsString("username"));
        response.put("tokenExpiry", jwt.getExpiresAt());
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint requiring multiple roles (OR condition)
     */
    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<Map<String, Object>> viewReports(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Reports accessible by Admin or Moderator");
        response.put("user", jwt.getClaimAsString("username"));
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user's roles/groups for debugging
     */
    @GetMapping("/my-roles")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyRoles(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        List<String> groups = jwt.getClaimAsStringList("cognito:groups");
        response.put("username", jwt.getClaimAsString("username"));
        response.put("cognitoGroups", groups);
        response.put("sub", jwt.getSubject());
        return ResponseEntity.ok(response);
    }
}
