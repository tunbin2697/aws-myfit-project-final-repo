package com.example.fitme.module.authentication.repository;

import com.example.fitme.module.authentication.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepo extends JpaRepository<UserProfile, UUID> {

    void deleteById(UUID id);


    Optional<UserProfile> findByCognitoId(String cognitoId);
    
    boolean existsByEmail(String email);
}
