package com.example.fitme.module.authentication.dto.UserProfileDTOs;

public record UserProfileResponseDTO(
        java.util.UUID id,
        String userName,
        String email,
        String birthdate,
        Boolean emailVerified,
        String gender,
        String name,
        String phoneNumber,
        String picture
) {
}
