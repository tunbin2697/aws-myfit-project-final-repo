package com.example.fitme.module.authentication.service.UserProfileService.impl;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileResponseDTO;
import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileUpdateRequestDTO;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.authentication.mapper.UserProfileMapper;
import com.example.fitme.module.authentication.repository.UserProfileRepo;
import com.example.fitme.module.authentication.service.UserProfileService.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.fitme.common.utils.OwnershipValidator;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepo userProfileRepo;
    private final UserProfileMapper userProfileMapper;
    private final OwnershipValidator ownershipValidator;

    @Override
    public UserProfileResponseDTO syncUser(String cognitoId, String email, String username, String birthdate, Boolean emailVerified, String gender, String name, String phoneNumber, String picture) {
        UserProfile userProfile = userProfileRepo.findByCognitoId(cognitoId)
                .orElseGet(() -> {
                    UserProfile newUser = new UserProfile();
                    newUser.setCognitoId(cognitoId);
                    return newUser;
                });

        userProfile.setEmail(email);
        userProfile.setUsername(username != null ? username : email);
        userProfile.setBirthdate(birthdate);
        userProfile.setEmailVerified(emailVerified);
        userProfile.setGender(gender);
        userProfile.setName(name);
        userProfile.setPhoneNumber(phoneNumber);
        userProfile.setPicture(picture);

        UserProfile saved = userProfileRepo.save(userProfile);
        return userProfileMapper.toUserInfoResponse(saved);
    }

    @Override
    public UserProfileResponseDTO updateUserProfile(UUID id, UserProfileUpdateRequestDTO request) {
        UserProfile userProfile = userProfileRepo.findById(id)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User profile not found"));

        // Authorization: only owner (or admin) can update
        ownershipValidator.checkUserOwnership(id);

        if (request.birthdate() != null) userProfile.setBirthdate(request.birthdate());
        if (request.gender() != null) userProfile.setGender(request.gender());
        if (request.name() != null) userProfile.setName(request.name());
        if (request.phoneNumber() != null) userProfile.setPhoneNumber(request.phoneNumber());
        if (request.picture() != null) userProfile.setPicture(request.picture());

        return userProfileMapper.toUserInfoResponse(userProfileRepo.save(userProfile));
    }

    @Override
    public UserProfileResponseDTO getUserProfileById(UUID userId) {
        // Authorization: only owner (or admin) can view
        ownershipValidator.checkUserOwnership(userId);

        UserProfile profile = userProfileRepo.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User profile not found"));
        return userProfileMapper.toUserInfoResponse(profile);
    }

    @Override
    public List<UserProfileResponseDTO> getAllUserProfile() {
        return userProfileRepo.findAll()
                .stream()
                .map(userProfileMapper::toUserInfoResponse)
                .toList();

    }

    @Override
    public void deleteUser(UUID id) {
        // Authorization: only owner (or admin) can delete
        ownershipValidator.checkUserOwnership(id);
        userProfileRepo.deleteById(id);
    }

    @Override
    public UUID getUserIdByCognitoId(String cognitoId) {
        return userProfileRepo.findByCognitoId(cognitoId)
                .map(UserProfile::getId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found for cognitoId: " + cognitoId));
    }

    @Override
    public UserProfile findById(String s) {

        return userProfileRepo.findById(UUID.fromString(s)).orElseThrow(
                () -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found for id: " + s)
        );
    }

}
