import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Exercise } from '../types/workout';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
export interface SessionExercise {
    id: string;           // UserWorkoutPlanExercise.id (or 'extra-{exerciseId}')
    exerciseId: string;   // real exercise UUID for logging
    name: string;
    sets: number;
    repsTarget: number;
    restSeconds: number;
    orderIndex: number;
    isExtra?: boolean;    // true if added by user during session
}

export interface CompletedSet {
    sessionExerciseId?: string;
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: number | null;
}

interface WorkoutSessionState {
    // Session Info
    sessionId: string | null;
    planId: string | null;
    planName: string | null;
    dayLabel: string | null;
    startTime: number | null;
    
    // Exercises
    exercises: SessionExercise[];

    // Progress State
    currentExIndex: number;
    currentSet: number;
    completedSets: CompletedSet[];
    phase: 'workout' | 'rest' | 'done';
    restSeconds: number;
    advanceExerciseAfterRest: boolean;

    // UI/Loading Flags
    isRestoring: boolean;
    isSavingLog: boolean;
}

const initialState: WorkoutSessionState = {
    sessionId: null,
    planId: null,
    planName: null,
    dayLabel: null,
    startTime: null,
    exercises: [],
    currentExIndex: 0,
    currentSet: 1,
    completedSets: [],
    phase: 'workout',
    restSeconds: 60,
    advanceExerciseAfterRest: false,
    isRestoring: false,
    isSavingLog: false,
};

const workoutSessionSlice = createSlice({
    name: 'workoutSession',
    initialState,
    reducers: {
        initializeSession(state, action: PayloadAction<{
            sessionId: string;
            planId?: string;
            planName?: string;
            dayLabel?: string;
            exercises: SessionExercise[];
        }>) {
            state.sessionId = action.payload.sessionId;
            state.planId = action.payload.planId ?? null;
            state.planName = action.payload.planName ?? null;
            state.dayLabel = action.payload.dayLabel ?? null;
            state.exercises = action.payload.exercises;
            state.startTime = Date.now();
            
            // Reset progress
            state.currentExIndex = 0;
            state.currentSet = 1;
            state.completedSets = [];
            state.phase = 'workout';
            state.restSeconds = 60;
            state.advanceExerciseAfterRest = false;
        },

        restoreSessionState(state, action: PayloadAction<{
            sessionId?: string;
            currentExIndex: number;
            currentSet: number;
            completedSets: CompletedSet[];
        }>) {
            if (action.payload.sessionId) {
                state.sessionId = action.payload.sessionId;
            }
            state.currentExIndex = action.payload.currentExIndex;
            state.currentSet = action.payload.currentSet;
            state.completedSets = action.payload.completedSets;
            state.phase = 'workout'; 
            state.advanceExerciseAfterRest = false;
        },

        logSetStart(state) {
            state.isSavingLog = true;
        },

        logSetSuccess(state, action: PayloadAction<{
            set: CompletedSet;
            exerciseTotalSets: number;
            isLastExercise: boolean;
            restSecs: number;
        }>) {
            state.isSavingLog = false;
            const { set, exerciseTotalSets, isLastExercise, restSecs } = action.payload;

            state.completedSets.push(set);

            const nextSet = state.currentSet + 1;
            const allSetsForExDone = nextSet > exerciseTotalSets;

            if (allSetsForExDone && isLastExercise) {
                state.phase = 'done';
                state.advanceExerciseAfterRest = false;
            } else {
                state.currentSet = allSetsForExDone ? state.currentSet : nextSet;
                state.phase = 'rest';
                state.restSeconds = restSecs;
                state.advanceExerciseAfterRest = allSetsForExDone && !isLastExercise;
            }
        },

        logSetFailure(state) {
            state.isSavingLog = false;
        },

        finishRest(state) {
            if (state.advanceExerciseAfterRest) {
                state.currentExIndex += 1;
                state.currentSet = 1;
            }
            state.phase = 'workout';
            state.advanceExerciseAfterRest = false;
        },

        skipExercise(state, action: PayloadAction<{ isLast: boolean }>) {
            if (action.payload.isLast) {
                state.phase = 'done';
                state.advanceExerciseAfterRest = false;
            } else {
                state.currentExIndex += 1;
                state.currentSet = 1;
                state.phase = 'workout';
                state.advanceExerciseAfterRest = false;
            }
        },

        skipSet(state, action: PayloadAction<{ exerciseTotalSets: number; isLastExercise: boolean }>) {
            const { exerciseTotalSets, isLastExercise } = action.payload;
            const nextSet = state.currentSet + 1;
            const allSetsForExDone = nextSet > exerciseTotalSets;

            if (allSetsForExDone) {
                if (isLastExercise) {
                    state.phase = 'done';
                    state.advanceExerciseAfterRest = false;
                } else {
                    state.currentExIndex += 1;
                    state.currentSet = 1;
                    state.phase = 'workout'; 
                    state.advanceExerciseAfterRest = false;
                }
            } else {
                state.currentSet = nextSet;
                state.phase = 'workout'; // no rest when skipping
                state.advanceExerciseAfterRest = false;
            }
        },

        addExtraExercise(state, action: PayloadAction<SessionExercise>) {
            state.exercises.push(action.payload);
        },

        endSession(state) {
            state.phase = 'done';
        },

        resetSession(state) {
            return initialState;
        }
    },
});

export const {
    initializeSession,
    restoreSessionState,
    logSetStart,
    logSetSuccess,
    logSetFailure,
    finishRest,
    skipExercise,
    skipSet,
    addExtraExercise,
    endSession,
    resetSession
} = workoutSessionSlice.actions;

export default workoutSessionSlice.reducer;
