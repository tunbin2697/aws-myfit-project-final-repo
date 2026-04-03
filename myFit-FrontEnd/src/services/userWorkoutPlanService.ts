import { api } from '../api/client';
import type {
    ApiResponse,
    UserWorkoutPlan,
    UserWorkoutPlanRequest,
    UserWorkoutPlanExercise,
    UserWorkoutPlanExerciseRequest,
} from '../types/workout';

const BASE_PATH = '/api/user-workout-plans';

/**
 * Create a new workout plan for the current user.
 * POST /api/user-workout-plans/me
 */
export const createMyPlan = async (data: UserWorkoutPlanRequest): Promise<UserWorkoutPlan> => {
    const response = await api.post<ApiResponse<UserWorkoutPlan>>(`${BASE_PATH}/me`, data);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to create workout plan');
    }
    return response.data.result;
};

/**
 * Clone a system plan into the current user's account.
 * POST /api/user-workout-plans/me/clone/{systemPlanId}
 */
export const cloneFromSystemPlan = async (systemPlanId: string): Promise<UserWorkoutPlan> => {
    const response = await api.post<ApiResponse<UserWorkoutPlan>>(
        `${BASE_PATH}/me/clone/${systemPlanId}`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to clone workout plan');
    }
    return response.data.result;
};

/**
 * Get all plans of the current user (summary — no exercises).
 * GET /api/user-workout-plans/me
 */
export const getMyPlans = async (): Promise<UserWorkoutPlan[]> => {
    const response = await api.get<ApiResponse<UserWorkoutPlan[]>>(`${BASE_PATH}/me`);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch workout plans');
    }
    return response.data.result;
};

/**
 * Get the currently active plan of the current user.
 * GET /api/user-workout-plans/me/active
 */
export const getMyActivePlan = async (): Promise<UserWorkoutPlan | null> => {
    try {
        const response = await api.get<ApiResponse<UserWorkoutPlan>>(`${BASE_PATH}/me/active`);
        if (response.data.code !== 1000) return null;
        return response.data.result;
    } catch {
        return null;
    }
};

/**
 * Get plan detail including all exercises.
 * GET /api/user-workout-plans/{id}
 */
export const getPlanById = async (id: string): Promise<UserWorkoutPlan> => {
    const response = await api.get<ApiResponse<UserWorkoutPlan>>(`${BASE_PATH}/${id}`);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch workout plan');
    }
    return response.data.result;
};

/**
 * Activate a plan (deactivates all others for this user).
 * PUT /api/user-workout-plans/{id}/activate
 */
export const activatePlan = async (id: string): Promise<UserWorkoutPlan> => {
    const response = await api.put<ApiResponse<UserWorkoutPlan>>(`${BASE_PATH}/${id}/activate`);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to activate workout plan');
    }
    return response.data.result;
};

/**
 * Update plan metadata.
 * PUT /api/user-workout-plans/{id}
 */
export const updatePlan = async (id: string, data: UserWorkoutPlanRequest): Promise<UserWorkoutPlan> => {
    const response = await api.put<ApiResponse<UserWorkoutPlan>>(`${BASE_PATH}/${id}`, data);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to update workout plan');
    }
    return response.data.result;
};

/**
 * Delete a plan.
 * DELETE /api/user-workout-plans/{id}
 */
export const deletePlan = async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<string>>(`${BASE_PATH}/${id}`);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to delete workout plan');
    }
};

/**
 * Get all exercises of a plan ordered by orderIndex.
 * GET /api/user-workout-plans/{planId}/exercises
 */
export const getPlanExercises = async (planId: string): Promise<UserWorkoutPlanExercise[]> => {
    const response = await api.get<ApiResponse<UserWorkoutPlanExercise[]>>(
        `${BASE_PATH}/${planId}/exercises`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch plan exercises');
    }
    return response.data.result;
};

/**
 * Add an exercise to a plan.
 * POST /api/user-workout-plans/{planId}/exercises
 */
export const addExerciseToPlan = async (
    planId: string,
    data: UserWorkoutPlanExerciseRequest
): Promise<UserWorkoutPlanExercise> => {
    const response = await api.post<ApiResponse<UserWorkoutPlanExercise>>(
        `${BASE_PATH}/${planId}/exercises`,
        data
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to add exercise to plan');
    }
    return response.data.result;
};

/**
 * Update an exercise in a plan.
 * PUT /api/user-workout-plans/{planId}/exercises/{exerciseId}
 */
export const updatePlanExercise = async (
    planId: string,
    exerciseId: string,
    data: UserWorkoutPlanExerciseRequest
): Promise<UserWorkoutPlanExercise> => {
    const response = await api.put<ApiResponse<UserWorkoutPlanExercise>>(
        `${BASE_PATH}/${planId}/exercises/${exerciseId}`,
        data
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to update plan exercise');
    }
    return response.data.result;
};

/**
 * Remove an exercise from a plan.
 * DELETE /api/user-workout-plans/{planId}/exercises/{exerciseId}
 */
export const removePlanExercise = async (planId: string, exerciseId: string): Promise<void> => {
    const response = await api.delete<ApiResponse<string>>(
        `${BASE_PATH}/${planId}/exercises/${exerciseId}`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to remove exercise from plan');
    }
};
