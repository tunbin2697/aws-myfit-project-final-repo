package com.example.fitme.module.session.repository;

import com.example.fitme.module.session.entity.UserWorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserWorkoutSessionRepository extends JpaRepository<UserWorkoutSession, UUID> {
    List<UserWorkoutSession> findByUser_Id(UUID userId);
    List<UserWorkoutSession> findByUser_IdAndWorkoutDate(UUID userId, java.time.LocalDate workoutDate);
    List<UserWorkoutSession> findByUser_IdAndIsActiveTrue(UUID userId);
    Optional<UserWorkoutSession> findFirstByUser_IdAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserWorkoutPlanId(UUID userWorkoutPlanId);
}
