import { api } from '../api/client';
import { ApiResponse, GoalTypeRequest, GoalTypeResponse } from '../types';

const BASE_PATH = '/api/goal-types';

/**
 * Create new goal type
 * POST /api/goal-types
 */
export const createGoalType = async (data: GoalTypeRequest): Promise<GoalTypeResponse> => {
    const response = await api.post<ApiResponse<GoalTypeResponse>>(BASE_PATH, data);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to create goal type');
    }

    return response.data.result;
};

/**
 * Get all goal types
 * GET /api/goal-types
 */
export const getAllGoalTypes = async (): Promise<GoalTypeResponse[]> => {
    const response = await api.get<ApiResponse<GoalTypeResponse[]>>(BASE_PATH);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch goal types');
    }

    return response.data.result;
};

/**
 * Get goal type by ID
 * GET /api/goal-types/{id}
 */
export const getGoalTypeById = async (id: string): Promise<GoalTypeResponse> => {
    const response = await api.get<ApiResponse<GoalTypeResponse>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch goal type');
    }

    return response.data.result;
};

/**
 * Get goal type by name
 * GET /api/goal-types/by-name/{name}
 */
export const getGoalTypeByName = async (name: string): Promise<GoalTypeResponse> => {
    const response = await api.get<ApiResponse<GoalTypeResponse>>(`${BASE_PATH}/by-name/${encodeURIComponent(name)}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch goal type');
    }

    return response.data.result;
};

/**
 * Update goal type
 * PUT /api/goal-types/{id}
 */
export const updateGoalType = async (
    id: string,
    data: GoalTypeRequest
): Promise<GoalTypeResponse> => {
    const response = await api.put<ApiResponse<GoalTypeResponse>>(`${BASE_PATH}/${id}`, data);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to update goal type');
    }

    return response.data.result;
};

/**
 * Delete goal type
 * DELETE /api/goal-types/{id}
 */
export const deleteGoalType = async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to delete goal type');
    }
};
