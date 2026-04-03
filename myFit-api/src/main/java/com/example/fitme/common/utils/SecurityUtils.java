package com.example.fitme.common.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public static Jwt getCurrentJwt() {
        return (Jwt) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    public static String getCurrentSub() {
        return getCurrentJwt().getSubject();
    }

    public static boolean hasRole(String role) {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}