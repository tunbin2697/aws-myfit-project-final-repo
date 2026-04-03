package com.example.fitme.module.system_workout.service.musclegroup;

import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupRequest;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;

import java.util.List;
import java.util.UUID;


public interface MuscleGroupService {
    
    /**
     * Create new muscle group.
     */
    MuscleGroupResponse create(MuscleGroupRequest request);
    
    /**
     * Get all muscle groups.
     */
    List<MuscleGroupResponse> getAll();
    
    /**
     * Get muscle group by ID.
     */
    MuscleGroupResponse getById(UUID id);
    
    /**
     * Update existing muscle group.
     */
    MuscleGroupResponse update(UUID id, MuscleGroupRequest request);
    
    /**
     * Delete muscle group.
     */
    void delete(UUID id);
}
