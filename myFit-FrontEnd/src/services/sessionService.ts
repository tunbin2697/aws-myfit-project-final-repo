import { api } from '../api/client';
import type {
    ApiResponse,
    CreateSessionRequest,
    SessionResponse,
    AddWorkoutLogRequest,
    WorkoutLogResponse,
} from '../types/workout';

const BASE_PATH = '/api/sessions';

/**
 * Create a new workout session.
 * POST /api/sessions
 */
export const createSession = async (data: CreateSessionRequest): Promise<SessionResponse> => {
    const response = await api.post<ApiResponse<SessionResponse>>(BASE_PATH, data);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to create session');
    }
    return response.data.result;
};

/**
 * Get session by ID.
 * GET /api/sessions/{id}
 */
export const getSession = async (id: string): Promise<SessionResponse> => {
    const response = await api.get<ApiResponse<SessionResponse>>(`${BASE_PATH}/${id}`);
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch session');
    }
    return response.data.result;
};

/**
 * Get all sessions for a user, optionally filtered by date range.
 * GET /api/sessions/user/{userId}[?from=YYYY-MM-DD&to=YYYY-MM-DD]
 */
export const getSessionsByUser = async (
    userId: string,
    options?: { from?: string; to?: string }
): Promise<SessionResponse[]> => {
    const params = new URLSearchParams();
    if (options?.from) params.append('from', options.from);
    if (options?.to) params.append('to', options.to);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<ApiResponse<SessionResponse[]>>(
        `${BASE_PATH}/user/${userId}${query}`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch user sessions');
    }
    return response.data.result;
};

/**
 * Get detailed sessions with logs for a user by specific date.
 * GET /api/sessions/user/{userId}/by-date?date=YYYY-MM-DD
 */
export const getSessionsByDate = async (
    userId: string,
    date: string
): Promise<SessionResponse[]> => {
    const response = await api.get<ApiResponse<SessionResponse[]>>(
        `${BASE_PATH}/user/${userId}/by-date?date=${date}`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to fetch detailed sessions for date');
    }
    return response.data.result;
};

/**
 * Get active session for a user.
 * GET /api/sessions/user/{userId}/active
 */
export const getActiveSessionByUser = async (
    userId: string
): Promise<SessionResponse | null> => {
    try {
        const response = await api.get<ApiResponse<SessionResponse>>(
            `${BASE_PATH}/user/${userId}/active`
        );
        if (response.data.code !== 1000) {
            throw new Error(response.data.message || 'Failed to fetch active session');
        }
        return response.data.result;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

/**
 * Deactivate an active session.
 * PATCH /api/sessions/{sessionId}/deactivate
 */
export const deactivateSession = async (
    sessionId: string
): Promise<SessionResponse> => {
    const response = await api.patch<ApiResponse<SessionResponse>>(
        `${BASE_PATH}/${sessionId}/deactivate`
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to deactivate session');
    }
    return response.data.result;
};


/**
 * Add a workout log entry to a session (one set of one exercise).
 * POST /api/sessions/{sessionId}/logs
 */
export const addWorkoutLog = async (
    sessionId: string,
    data: AddWorkoutLogRequest
): Promise<WorkoutLogResponse> => {
    const response = await api.post<ApiResponse<WorkoutLogResponse>>(
        `${BASE_PATH}/${sessionId}/logs`,
        data
    );
    if (response.data.code !== 1000) {
        throw new Error(response.data.message || 'Failed to add workout log');
    }
    return response.data.result;
};
