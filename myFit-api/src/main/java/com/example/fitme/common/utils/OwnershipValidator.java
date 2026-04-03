package com.example.fitme.common.utils;

import com.example.fitme.common.exception.ApiException;
import com.example.fitme.common.exception.ErrorCode;
import com.example.fitme.module.authentication.entity.UserProfile;
import com.example.fitme.module.authentication.repository.UserProfileRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OwnershipValidator {

    private final UserProfileRepo userProfileRepository;

    public void checkUserOwnership(UUID userId) {
        String currentSub = SecurityUtils.getCurrentSub();

        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (user.getCognitoId() == null || !user.getCognitoId().equals(currentSub)) {
            if (!SecurityUtils.hasRole("ADMIN")) {
                throw new ApiException(ErrorCode.FORBIDDEN_ACTION, "You cannot access this resource");
            }
        }
    }
}