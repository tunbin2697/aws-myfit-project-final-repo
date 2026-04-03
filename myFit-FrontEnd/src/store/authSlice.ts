import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: {
    id: string;
    email?: string;
    username?: string;
    [key: string]: any;
  } | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: any; token: string; refreshToken?: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      
      // Onboarding flow is separate now, so we assume auth onboarding is complete
      state.hasCompletedOnboarding = true;
      
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.hasCompletedOnboarding = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
    updateUserProfile: (state, action: PayloadAction<Record<string, any>>) => {
      if (!state.user) return;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
});

export const { login, logout, completeOnboarding, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;

