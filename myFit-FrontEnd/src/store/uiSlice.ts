import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  planEditorDay: number | null;
  plansReloadKey: number;
  /** exercise id → name cache, shared across workout screens */
  exerciseNameCache: Record<string, string>;
}

const initialState: UIState = {
  planEditorDay: null,
  plansReloadKey: Date.now(),
  exerciseNameCache: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPlanEditorDay(state, action: PayloadAction<number | null>) {
      state.planEditorDay = action.payload;
    },
    bumpPlansReloadKey(state) {
      state.plansReloadKey = Date.now();
    },
    setExerciseNameCache(state, action: PayloadAction<Record<string, string>>) {
      state.exerciseNameCache = action.payload;
    },
    mergeExerciseNameCache(state, action: PayloadAction<Record<string, string>>) {
      state.exerciseNameCache = { ...state.exerciseNameCache, ...action.payload };
    },
  },
});

export const {
  setPlanEditorDay,
  bumpPlansReloadKey,
  setExerciseNameCache,
  mergeExerciseNameCache,
} = uiSlice.actions;
export default uiSlice.reducer;
