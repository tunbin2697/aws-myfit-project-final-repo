// package com.example.fitme.module.testing_template.service.TestService.impl;

// import com.example.fitme.common.exception.ApiException;
// import com.example.fitme.common.exception.ErrorCode;
// import com.example.fitme.module.entity.UserProfile;
// import com.example.fitme.module.repo.TestRepo;
// import com.example.fitme.module.testing_template.dto.TestCreateRequestDTO;
// import com.example.fitme.module.testing_template.dto.TestResponseDTO;
// import com.example.fitme.module.testing_template.mapper.TestMapper;
// import com.example.fitme.module.testing_template.service.TestService.TestService;

// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.UUID;

// @Service
// @RequiredArgsConstructor
// public class TestServiceImpl implements TestService {
//     private final TestRepo testRepo;
//     private final TestMapper testMapper;

//     @Override
//     public TestResponseDTO createUser(TestCreateRequestDTO requestDTO){
//         if (testRepo.existsByEmail(requestDTO.email())){
//             throw  new ApiException(ErrorCode.INVALID_INFO);
//         }

//         // Adapted Example to use UserProfile
//         UserProfile profile = testMapper.toEntity(requestDTO);
//         profile.setId(UUID.randomUUID());
//         testRepo.save(profile);
        
//         return testMapper.toResponse(profile);
//     }
//     @Override
//     public TestResponseDTO getUsersById(UUID id) {
//         UserProfile user = testRepo.findById(id)
//                 .orElseThrow(() -> new ApiException(ErrorCode.INVALID_INFO));
//         return testMapper.toResponse(user);
//     }

//     @Override
//     public List<TestResponseDTO> getAllUsers() {
//         return testRepo.findAll().stream()
//                 .map(testMapper::toResponse)
//                 .toList();
//     }

//     @Override
//     public void deleteUser(UUID id) {
//         testRepo.deleteById(id);
//     }
// }
