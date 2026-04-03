package com.example.fitme.module.session.repository;

import com.example.fitme.module.session.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, UUID> {
    List<WorkoutLog> findByUserWorkoutSession_IdOrderByCreatedAt(UUID sessionId);
}
