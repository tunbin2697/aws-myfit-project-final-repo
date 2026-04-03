package com.example.fitme.module.system_workout.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupRequest;
import com.example.fitme.module.system_workout.dto.musclegroup.MuscleGroupResponse;
import com.example.fitme.module.system_workout.service.musclegroup.MuscleGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/admin/muscle-groups")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMuscleGroupController {

    private final MuscleGroupService muscleGroupService;
    private static final String BASE_PATH = "/api/admin/muscle-groups";

    /**
     * Create new muscle group.
     * POST /api/admin/muscle-groups
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MuscleGroupResponse>> create(
            @Valid @RequestBody MuscleGroupRequest request) {
        
        MuscleGroupResponse response = muscleGroupService.create(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<MuscleGroupResponse>builder()
                        .code(1000)
                        .message("Muscle group created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path(BASE_PATH)
                        .build());
    }

    /**
     * Get all muscle groups.
     * GET /api/admin/muscle-groups
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MuscleGroupResponse>>> getAll() {
        List<MuscleGroupResponse> response = muscleGroupService.getAll();
        
        return ResponseEntity.ok(ApiResponse.<List<MuscleGroupResponse>>builder()
                .code(1000)
                .message("Muscle groups retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH)
                .build());
    }

    /**
     * Get muscle group by ID.
     * GET /api/admin/muscle-groups/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MuscleGroupResponse>> getById(@PathVariable UUID id) {
        MuscleGroupResponse response = muscleGroupService.getById(id);
        
        return ResponseEntity.ok(ApiResponse.<MuscleGroupResponse>builder()
                .code(1000)
                .message("Muscle group retrieved successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Update existing muscle group.
     * PUT /api/admin/muscle-groups/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MuscleGroupResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MuscleGroupRequest request) {
        
        MuscleGroupResponse response = muscleGroupService.update(id, request);
        
        return ResponseEntity.ok(ApiResponse.<MuscleGroupResponse>builder()
                .code(1000)
                .message("Muscle group updated successfully")
                .result(response)
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }

    /**
     * Delete muscle group.
     * DELETE /api/admin/muscle-groups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        muscleGroupService.delete(id);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Muscle group deleted successfully")
                .timestamp(Instant.now())
                .path(BASE_PATH + "/" + id)
                .build());
    }
}
