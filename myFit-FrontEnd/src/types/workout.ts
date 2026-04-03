// Workout API Types

export interface MuscleGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  imageUrl?: string | null;
  description: string | null;
  equipment: string | null;
  muscleGroup: MuscleGroup;
  createdAt: string;
  updatedAt: string;
}

export interface GoalType {
  id: string;
  name: string;
  description: string | null;
}

export interface WorkoutPlanExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  restSeconds: number;
  orderIndex: number;
}

export interface WorkoutPlanSummary {
  id: string;
  name: string;
  imageUrl?: string | null;
  description: string | null;
  goalType: GoalType;
  isSystem: boolean;
  createdBy: 'SYSTEM' | 'USER';
  exerciseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  imageUrl?: string | null;
  description: string | null;
  goalType: GoalType;
  isSystem: boolean;
  createdBy: 'SYSTEM' | 'USER';
  exercises: WorkoutPlanExercise[];
  createdAt: string;
  updatedAt: string;
}

// =====================================
// User Workout Plan Types
// =====================================

export interface UserWorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  goalTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exercises?: UserWorkoutPlanExercise[];
}

export interface UserWorkoutPlanExercise {
  id: string;
  userWorkoutPlanId: string;
  exerciseId: string;
  dayOfWeek: number | null;   // 1=Thứ 2 ... 7=CN
  sets: number;
  reps: number;
  restSeconds: number;
  dayIndex: number | null;
  weekIndex: number | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserWorkoutPlanRequest {
  name: string;
  description?: string;
  goalTypeId?: string;
  isActive?: boolean;
}

export interface UserWorkoutPlanExerciseRequest {
  exerciseId: string;
  dayOfWeek?: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  dayIndex?: number;
  weekIndex?: number;
  orderIndex?: number;
}

// =====================================
// Session Types
// =====================================

export interface CreateSessionRequest {
  userId: string;
  userWorkoutPlanId: string;
  workoutDate: string;        // LocalDate format: YYYY-MM-DD
  weekIndex?: number;
  dayIndex?: number;
}

export interface WorkoutLogResponse {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  createdAt: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  userWorkoutPlanId: string;
  workoutDate: string;
  isActive: boolean;
  weekIndex: number | null;
  dayIndex: number | null;
  // NOTE: exercises field removed in BE commit 41bb775
  logs: WorkoutLogResponse[];
}


export interface AddWorkoutLogRequest {
  exerciseId: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  durationSeconds?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
  timestamp: string;
  path: string;
}

// Request Types for Admin CRUD

export interface MuscleGroupRequest {
  name: string;
  description?: string;
}

export interface ExerciseRequest {
  name: string;
  description?: string;
  equipment?: string;
  muscleGroupId: string;    // @NotNull — required since commit 41bb775
}

export interface WorkoutPlanExerciseRequest {
  exerciseId: string;
  dayOfWeek: number;        // @NotNull — required since commit 41bb775
  sets: number;             // @NotNull
  reps: number;             // @NotNull
  restSeconds: number;      // @NotNull
  dayIndex: number;         // @NotNull
  weekIndex: number;        // @NotNull
  orderIndex: number;       // @NotNull
}

export interface WorkoutPlanRequest {
  name: string;
  description?: string;
  goalTypeId: string;       // @NotNull — required since commit 41bb775
  exercises?: WorkoutPlanExerciseRequest[];
}

