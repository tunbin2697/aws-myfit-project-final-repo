import { api } from '../api/client';
import { ApiResponse, CalculateMetricsRequest, HealthCalculationResponse } from '../types';

const BASE_PATH = '/api/metrics';

type RawHealthCalculationResponse = HealthCalculationResponse & {
    mustMeetMacros?: HealthCalculationResponse['macros'];
    recommendedMacros?: HealthCalculationResponse['macros'];
    macroMustMeet?: HealthCalculationResponse['macros'];
    macroRecommended?: HealthCalculationResponse['macros'];
};

const normalizeCalculation = (raw: RawHealthCalculationResponse): HealthCalculationResponse => {
    const macros =
        raw.macros ??
        raw.mustMeetMacros ??
        raw.recommendedMacros ??
        raw.macroMustMeet ??
        raw.macroRecommended ?? { protein: 0, carbs: 0, fat: 0 };

    return {
        ...raw,
        macros,
    };
};


/**
 * Calculate health metrics and save
 * POST /api/metrics/calculate
 */
export const calculateMetrics = async (
    data: CalculateMetricsRequest
): Promise<HealthCalculationResponse> => {
    const response = await api.post<ApiResponse<RawHealthCalculationResponse>>(`${BASE_PATH}/calculate`, data);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to calculate metrics');
    }

    return normalizeCalculation(response.data.result);
};

/**
 * Get user's calculation history
 * GET /api/metrics/user/{userId}
 */
export const getUserHealthHistory = async (userId: string): Promise<HealthCalculationResponse[]> => {
    const response = await api.get<ApiResponse<RawHealthCalculationResponse[]>>(`${BASE_PATH}/user/${userId}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch health history');
    }

    return (response.data.result ?? []).map(normalizeCalculation);
};

/**
 * Get latest calculation for user
 * GET /api/metrics/user/{userId}/latest
 */
export const getLatestHealthCalculation = async (userId: string): Promise<HealthCalculationResponse> => {
    const response = await api.get<ApiResponse<RawHealthCalculationResponse>>(`${BASE_PATH}/user/${userId}/latest`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch latest calculation');
    }

    return normalizeCalculation(response.data.result);
};

/**
 * Get calculation by ID
 * GET /api/metrics/{id}
 */
export const getHealthCalculationById = async (id: string): Promise<HealthCalculationResponse> => {
    const response = await api.get<ApiResponse<RawHealthCalculationResponse>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch calculation');
    }

    return normalizeCalculation(response.data.result);
};

/**
 * Delete calculation
 * DELETE /api/metrics/{id}
 */
export const deleteHealthCalculation = async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`${BASE_PATH}/${id}`);

    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to delete calculation');
    }
};
