package com.example.fitme.module.authentication.mapper;

import com.example.fitme.module.authentication.dto.UserProfileDTOs.UserProfileResponseDTO;
import com.example.fitme.module.authentication.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserProfileMapper {
    public UserProfileResponseDTO toUserInfoResponse(UserProfile userProfile){
        return new UserProfileResponseDTO(
                userProfile.getId(),
                userProfile.getUsername(),
                userProfile.getEmail(),
                userProfile.getBirthdate(),
                userProfile.getEmailVerified(),
                userProfile.getGender(),
                userProfile.getName(),
                userProfile.getPhoneNumber(),
                userProfile.getPicture()
        );
    }
}
