package com.example.fitme.module.controller;

/*
import com.example.fitme.module.dto.UserProfileDTOs.UserProfileResponseDTO;
import com.example.fitme.module.dto.UserProfileDTOs.UserProfileUpdateRequestDTO;
import com.example.fitme.module.service.UserProfileService.UserProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserProfileController.class)
@AutoConfigureMockMvc
class UserProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserProfileService userProfileService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserProfileResponseDTO userProfileResponseDTO;
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        userProfileResponseDTO = new UserProfileResponseDTO(
                userId, "testuser", "test@example.com", "1990-01-01", true, "male", "Test User", "123456789", "pic.jpg"
        );
    }

    @Test
    void syncUser_shouldReturnProfile_whenJwtIsValid() throws Exception {
        when(userProfileService.syncUser(anyString(), anyString(), anyString(), any(), any(), any(), any(), any(), any()))
                .thenReturn(userProfileResponseDTO);

        mockMvc.perform(post("/user/sync")
                        .with(jwt().jwt(jwt -> jwt
                                .subject("cognito-123")
                                .claim("email", "test@example.com")
                                .claim("username", "testuser")
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getById_shouldReturnProfile_whenUserExists() throws Exception {
        when(userProfileService.getUserProfileById(userId)).thenReturn(userProfileResponseDTO);

        mockMvc.perform(get("/user/{id}", userId)
                        .with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    void getAll_shouldReturnListOfProfiles() throws Exception {
        when(userProfileService.getAllUserProfile()).thenReturn(Collections.singletonList(userProfileResponseDTO));

        mockMvc.perform(get("/user")
                        .with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userId.toString()));
    }

    @Test
    void update_shouldReturnUpdatedProfile() throws Exception {
        UserProfileUpdateRequestDTO request = new UserProfileUpdateRequestDTO(
                "1990-01-01", "female", "Test Update", "111222333", "updated.jpg"
        );
        when(userProfileService.updateUserProfile(eq(userId), any(UserProfileUpdateRequestDTO.class)))
                .thenReturn(userProfileResponseDTO);

        mockMvc.perform(put("/user/{id}", userId)
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(userProfileService).deleteUser(userId);

        mockMvc.perform(delete("/user/{id}", userId)
                        .with(jwt()))
                .andExpect(status().isNoContent());
    }
}
*/
