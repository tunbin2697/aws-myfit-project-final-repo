package com.example.fitme.module.system_goal.service;

import com.example.fitme.module.system_goal.dto.GoalTypeRequest;
import com.example.fitme.module.system_goal.dto.GoalTypeResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for GoalType CRUD operations.
 */
public interface GoalTypeService {
    
    /**
     * Create new goal type.
     */
    GoalTypeResponse create(GoalTypeRequest request);
    
    /**
     * Get all goal types.
     */
    List<GoalTypeResponse> getAll();
    
    /**
     * Get goal type by ID.
     */
    GoalTypeResponse getById(UUID id);
    
    /**
     * Get goal type by name.
     */
    GoalTypeResponse getByName(String name);
    
    /**
     * Update existing goal type.
     */
    GoalTypeResponse update(UUID id, GoalTypeRequest request);
    
    /**
     * Delete goal type.
     */
    void delete(UUID id);
}
