// package com.example.fitme.module.testing_template.mapper;

// import com.example.fitme.module.entity.UserProfile;
// import com.example.fitme.module.testing_template.dto.TestCreateRequestDTO;
// import com.example.fitme.module.testing_template.dto.TestResponseDTO;

// import org.springframework.stereotype.Component;

// @Component
// public class TestMapper {
//     public UserProfile toEntity(TestCreateRequestDTO testCreateRequestDTO){
//         return UserProfile.builder()
//                 .username(testCreateRequestDTO.userName())
//                 .email(testCreateRequestDTO.email())
//                 .build();
//     }

//     public TestResponseDTO toResponse(UserProfile user){
//         return new TestResponseDTO(
//                 user.getId(),
//                 user.getUsername(),
//                 user.getEmail()
//         );
//     }
// }
