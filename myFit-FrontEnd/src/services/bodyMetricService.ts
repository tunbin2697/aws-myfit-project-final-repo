import { api } from '../api/client';
import { ApiResponse, BodyMetricRequest, BodyMetricResponse } from '../types';

const BASE_PATH = '/api/body-metrics';


/**
 * Create new body metric
 * POST /api/body-metrics
 */
export const createBodyMetric = async (data: BodyMetricRequest): Promise<BodyMetricResponse> => {
    const response = await api.post<ApiResponse<BodyMetricResponse>>(BASE_PATH, data);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to create body metric');
    }

    return response.data.result;
};

/**
 * Get all body metrics for a user (ordered by newest first)
 * GET /api/body-metrics/user/{userId}
 */
export const getUserBodyMetrics = async (userId: string): Promise<BodyMetricResponse[]> => {
    const response = await api.get<ApiResponse<BodyMetricResponse[]>>(`${BASE_PATH}/user/${userId}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch body metrics');
    }

    return response.data.result;
};

/**
 * Get latest body metric for a user
 * GET /api/body-metrics/user/{userId}/latest
 */
export const getLatestBodyMetric = async (userId: string): Promise<BodyMetricResponse> => {
    const response = await api.get<ApiResponse<BodyMetricResponse>>(`${BASE_PATH}/user/${userId}/latest`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch latest body metric');
    }

    return response.data.result;
};

/**
 * Get body metric by ID
 * GET /api/body-metrics/{id}
 */
export const getBodyMetricById = async (id: string): Promise<BodyMetricResponse> => {
    const response = await api.get<ApiResponse<BodyMetricResponse>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch body metric');
    }

    return response.data.result;
};

/**
 * Update body metric
 * PUT /api/body-metrics/{id}
 */
export const updateBodyMetric = async (
    id: string,
    data: BodyMetricRequest
): Promise<BodyMetricResponse> => {
    const response = await api.put<ApiResponse<BodyMetricResponse>>(`${BASE_PATH}/${id}`, data);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to update body metric');
    }

    return response.data.result;
};

/**
 * Delete body metric
 * DELETE /api/body-metrics/{id}
 */
export const deleteBodyMetric = async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to delete body metric');
    }
};
