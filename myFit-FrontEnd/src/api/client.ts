import axios from 'axios';
import { getItem } from '../utils/storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let isForceLoggingOut = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const isDeletedUserResponse = (error: any): boolean => {
  const data = error?.response?.data;
  if (!data) return false;

  const code = Number(data.code);
  const message = String(data.message ?? '').toLowerCase();

  return code === 4040 && message.includes('user not found for cognitoid');
};

const forceLogout = async () => {
  if (isForceLoggingOut) return;
  isForceLoggingOut = true;

  try {
    const [{ clearTokens }, { store }, { logout }] = await Promise.all([
      import('../services/authService'),
      import('../store'),
      import('../store/authSlice'),
    ]);

    await clearTokens();
    store.dispatch(logout());
  } finally {
    isForceLoggingOut = false;
  }
};

// Request interceptor to attach the auth token if needed
api.interceptors.request.use(
  async (config) => {
    try {
        // Only add token if Authorization header is not already set
        if (!config.headers.Authorization) {
            const token = await getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.error('Error fetching token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isDeletedUserResponse(error)) {
      processQueue(new Error('User deleted'), null);
      await forceLogout();
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Import dynamically to avoid circular dependency
        const { refreshAccessToken, clearTokens } = await import('../services/authService');
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          await clearTokens();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
