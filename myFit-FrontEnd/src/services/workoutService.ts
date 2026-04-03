import { api } from '../api/client';
import type {
  MuscleGroup,
  Exercise,
  WorkoutPlan,
  WorkoutPlanSummary,
  WorkoutPlanExercise,
  ApiResponse,
  MuscleGroupRequest,
  ExerciseRequest,
  WorkoutPlanRequest,
  WorkoutPlanExerciseRequest,
} from '../types/workout';
import {
  getExerciseImageUrl,
  getExerciseImageUrlMap,
  getWorkoutPlanImageUrl,
  getWorkoutPlanImageUrlMap,
} from './mediaService';

const BASE_PATH = '/api/workouts';
const ADMIN_PATH = '/api/admin';

const attachExerciseImages = async (exercises: Exercise[]): Promise<Exercise[]> => {
  if (!exercises.length) return exercises;

  const imageMap = await getExerciseImageUrlMap(exercises.map(exercise => exercise.id));
  return exercises.map(exercise => ({
    ...exercise,
    imageUrl: imageMap[exercise.id] ?? null,
  }));
};

const attachPlanSummaryImages = async (
  plans: WorkoutPlanSummary[],
): Promise<WorkoutPlanSummary[]> => {
  if (!plans.length) return plans;

  const imageMap = await getWorkoutPlanImageUrlMap(plans.map(plan => plan.id));
  return plans.map(plan => ({
    ...plan,
    imageUrl: imageMap[plan.id] ?? null,
  }));
};

const attachPlanDetailImages = async (plan: WorkoutPlan): Promise<WorkoutPlan> => {
  const [planImageUrl, exerciseImageMap] = await Promise.all([
    getWorkoutPlanImageUrl(plan.id),
    getExerciseImageUrlMap((plan.exercises ?? []).map(item => item.exercise.id)),
  ]);

  return {
    ...plan,
    imageUrl: planImageUrl,
    exercises: (plan.exercises ?? []).map(item => ({
      ...item,
      exercise: {
        ...item.exercise,
        imageUrl: exerciseImageMap[item.exercise.id] ?? null,
      },
    })),
  };
};

// ========== Muscle Groups ==========

export const getMuscleGroups = async (): Promise<MuscleGroup[]> => {
  const response = await api.get<ApiResponse<MuscleGroup[]>>(`${BASE_PATH}/muscle-groups`);
  return response.data.result;
};

export const getMuscleGroupById = async (id: string): Promise<MuscleGroup> => {
  const response = await api.get<ApiResponse<MuscleGroup>>(`${BASE_PATH}/muscle-groups/${id}`);
  return response.data.result;
};

// ========== Exercises ==========

export const getExercises = async (): Promise<Exercise[]> => {
  const response = await api.get<ApiResponse<Exercise[]>>(`${BASE_PATH}/exercises`);
  return attachExerciseImages(response.data.result ?? []);
};

export const getExercisesLite = async (): Promise<Exercise[]> => {
  const response = await api.get<ApiResponse<Exercise[]>>(`${BASE_PATH}/exercises`);
  return response.data.result ?? [];
};

export const getExerciseImagesByIds = async (
  exerciseIds: string[],
): Promise<Record<string, string | null>> => {
  return getExerciseImageUrlMap(exerciseIds);
};

export const getExerciseById = async (id: string): Promise<Exercise> => {
  const response = await api.get<ApiResponse<Exercise>>(`${BASE_PATH}/exercises/${id}`);
  return {
    ...response.data.result,
    imageUrl: await getExerciseImageUrl(id),
  };
};

export const getExercisesByMuscleGroup = async (muscleGroupId: string): Promise<Exercise[]> => {
  const response = await api.get<ApiResponse<Exercise[]>>(
    `${BASE_PATH}/exercises/by-muscle-group/${muscleGroupId}`
  );
  return attachExerciseImages(response.data.result ?? []);
};

export const createCustomExercise = async (name: string): Promise<Exercise> => {
  const response = await api.post<ApiResponse<Exercise>>(`${BASE_PATH}/exercises/custom`, { name });
  return response.data.result;
};

// ========== Workout Plans ==========

export const getWorkoutPlans = async (): Promise<WorkoutPlanSummary[]> => {
  const response = await api.get<ApiResponse<WorkoutPlanSummary[]>>(`${BASE_PATH}/plans`);
  return attachPlanSummaryImages(response.data.result ?? []);
};

export const getWorkoutPlanById = async (id: string): Promise<WorkoutPlan> => {
  const response = await api.get<ApiResponse<WorkoutPlan>>(`${BASE_PATH}/plans/${id}`);
  return attachPlanDetailImages(response.data.result);
};

export const getWorkoutPlansByGoalType = async (goalTypeId: string): Promise<WorkoutPlanSummary[]> => {
  const response = await api.get<ApiResponse<WorkoutPlanSummary[]>>(
    `${BASE_PATH}/plans/by-goal-type/${goalTypeId}`
  );
  return attachPlanSummaryImages(response.data.result ?? []);
};

// ==========================================================
// ADMIN CRUD Operations (requires ADMIN role)
// ==========================================================

// ========== Admin Muscle Groups ==========

export const adminCreateMuscleGroup = async (data: MuscleGroupRequest): Promise<MuscleGroup> => {
  const response = await api.post<ApiResponse<MuscleGroup>>(`${ADMIN_PATH}/muscle-groups`, data);
  return response.data.result;
};

export const adminUpdateMuscleGroup = async (id: string, data: MuscleGroupRequest): Promise<MuscleGroup> => {
  const response = await api.put<ApiResponse<MuscleGroup>>(`${ADMIN_PATH}/muscle-groups/${id}`, data);
  return response.data.result;
};

export const adminDeleteMuscleGroup = async (id: string): Promise<void> => {
  await api.delete(`${ADMIN_PATH}/muscle-groups/${id}`);
};

// ========== Admin Exercises ==========

export const adminCreateExercise = async (data: ExerciseRequest): Promise<Exercise> => {
  const response = await api.post<ApiResponse<Exercise>>(`${ADMIN_PATH}/exercises`, data);
  return response.data.result;
};

export const adminUpdateExercise = async (id: string, data: ExerciseRequest): Promise<Exercise> => {
  const response = await api.put<ApiResponse<Exercise>>(`${ADMIN_PATH}/exercises/${id}`, data);
  return response.data.result;
};

export const adminDeleteExercise = async (id: string): Promise<void> => {
  await api.delete(`${ADMIN_PATH}/exercises/${id}`);
};

// ========== Admin Workout Plans ==========

export const adminCreateWorkoutPlan = async (data: WorkoutPlanRequest): Promise<WorkoutPlan> => {
  const response = await api.post<ApiResponse<WorkoutPlan>>(`${ADMIN_PATH}/workout-plans`, data);
  return response.data.result;
};

export const adminUpdateWorkoutPlan = async (id: string, data: WorkoutPlanRequest): Promise<WorkoutPlan> => {
  const response = await api.put<ApiResponse<WorkoutPlan>>(`${ADMIN_PATH}/workout-plans/${id}`, data);
  return response.data.result;
};

export const adminDeleteWorkoutPlan = async (id: string): Promise<void> => {
  await api.delete(`${ADMIN_PATH}/workout-plans/${id}`);
};

export const adminAddExerciseToPlan = async (
  planId: string,
  data: WorkoutPlanExerciseRequest
): Promise<WorkoutPlan> => {
  const response = await api.post<ApiResponse<WorkoutPlan>>(
    `${ADMIN_PATH}/workout-plans/${planId}/exercises`,
    data
  );
  return response.data.result;
};

export const adminUpdatePlanExercise = async (
  planId: string,
  exerciseId: string,
  data: WorkoutPlanExerciseRequest
): Promise<WorkoutPlanExercise> => {
  const response = await api.put<ApiResponse<WorkoutPlanExercise>>(
    `${ADMIN_PATH}/workout-plans/${planId}/exercises/${exerciseId}`,
    data
  );
  return response.data.result;
};

export const adminRemoveExerciseFromPlan = async (planId: string, exerciseId: string): Promise<void> => {
  await api.delete(`${ADMIN_PATH}/workout-plans/${planId}/exercises/${exerciseId}`);
};
