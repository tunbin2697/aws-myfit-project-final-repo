package com.example.fitme.module.authentication.dto.UserProfileDTOs;

public record UserProfileUpdateRequestDTO(
        String birthdate,
        String gender,
        String name,
        String phoneNumber,
        String picture
) {
}
