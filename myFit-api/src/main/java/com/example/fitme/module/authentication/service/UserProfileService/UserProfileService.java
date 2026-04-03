package com.example.fitme.module.authentication.service.UserProfileService;

import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileResponseDTO;
import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileUpdateRequestDTO;
import com.example.fitme.module.authentication.entity.UserProfile;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public interface UserProfileService {

    UserProfileResponseDTO getUserProfileById(UUID id);

    List<UserProfileResponseDTO> getAllUserProfile();

    UserProfileResponseDTO syncUser(String cognitoId, String email, String username, String birthdate, Boolean emailVerified, String gender, String name, String phoneNumber, String picture);

    UserProfileResponseDTO updateUserProfile(UUID id, UserProfileUpdateRequestDTO request);

    void deleteUser(UUID id);

    UUID getUserIdByCognitoId(String cognitoId);

    UserProfile findById(@NotBlank String s);
}
