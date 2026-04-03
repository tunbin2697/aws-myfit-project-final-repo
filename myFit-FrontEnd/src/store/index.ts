import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import workoutSessionReducer from './workoutSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    workoutSession: workoutSessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
