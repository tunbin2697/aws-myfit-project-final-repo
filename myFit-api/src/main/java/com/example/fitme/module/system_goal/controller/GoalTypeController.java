package com.example.fitme.module.system_goal.controller;

import com.example.fitme.common.response.ApiResponse;
import com.example.fitme.module.system_goal.dto.GoalTypeRequest;
import com.example.fitme.module.system_goal.dto.GoalTypeResponse;
import com.example.fitme.module.system_goal.service.GoalTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/goal-types")
@RequiredArgsConstructor
public class GoalTypeController {

    private final GoalTypeService goalTypeService;

    /**
     * Create new goal type.
     * POST /api/goal-types
     */
    @PostMapping
    public ResponseEntity<ApiResponse<GoalTypeResponse>> create(
            @Valid @RequestBody GoalTypeRequest request) {
        
        GoalTypeResponse response = goalTypeService.create(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<GoalTypeResponse>builder()
                        .code(1000)
                        .message("Goal type created successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/goal-types")
                        .build());
    }

    /**
     * Get all goal types.
     * GET /api/goal-types
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalTypeResponse>>> getAll() {
        List<GoalTypeResponse> response = goalTypeService.getAll();
        
        return ResponseEntity.ok()
                .body(ApiResponse.<List<GoalTypeResponse>>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/goal-types")
                        .build());
    }

    /**
     * Get goal type by ID.
     * GET /api/goal-types/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalTypeResponse>> getById(
            @PathVariable UUID id) {
        
        GoalTypeResponse response = goalTypeService.getById(id);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<GoalTypeResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/goal-types/" + id)
                        .build());
    }

    /**
     * Get goal type by name.
     * GET /api/goal-types/by-name/{name}
     */
    @GetMapping("/by-name/{name}")
    public ResponseEntity<ApiResponse<GoalTypeResponse>> getByName(
            @PathVariable String name) {
        
        GoalTypeResponse response = goalTypeService.getByName(name);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<GoalTypeResponse>builder()
                        .code(1000)
                        .message("Success")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/goal-types/by-name/" + name)
                        .build());
    }

    /**
     * Update goal type.
     * PUT /api/goal-types/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalTypeResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody GoalTypeRequest request) {
        
        GoalTypeResponse response = goalTypeService.update(id, request);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<GoalTypeResponse>builder()
                        .code(1000)
                        .message("Goal type updated successfully")
                        .result(response)
                        .timestamp(Instant.now())
                        .path("/api/goal-types/" + id)
                        .build());
    }

    /**
     * Delete goal type.
     * DELETE /api/goal-types/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        goalTypeService.delete(id);
        
        return ResponseEntity.ok()
                .body(ApiResponse.<Void>builder()
                        .code(1000)
                        .message("Goal type deleted successfully")
                        .result(null)
                        .timestamp(Instant.now())
                        .path("/api/goal-types/" + id)
                        .build());
    }
}
