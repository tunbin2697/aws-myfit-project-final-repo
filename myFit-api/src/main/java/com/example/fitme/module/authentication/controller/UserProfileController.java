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

    // @GetMapping
    // public List<UserProfileResponseDTO> getAll() {
    //     return userProfileService.getAllUserProfile();
    // }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userProfileService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
