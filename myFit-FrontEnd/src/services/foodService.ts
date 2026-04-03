import { api } from '../api/client';
import {
  ApiResponse,
  DailyNutritionResponse,
  FoodResponse,
  MealFoodRequest,
  MealFoodResponse,
  MealRequest,
  MealResponse,
  MealType,
  PageResponse,
} from '../types';
import { getFoodImageUrlMap } from './mediaService';

const FOOD_BASE = '/api/foods';
const MEAL_BASE = '/api/meals';
const MEAL_FOOD_BASE = '/api/meal-foods';
const DAILY_NUTRITION_BASE = '/api/daily-nutrition';

const buildUserQuery = (userId?: string): string => {
  if (!userId) return '';
  const encoded = encodeURIComponent(userId);
  return `&userId=${encoded}&user_id=${encoded}`;
};

export const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatLocalDateTime = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
};

export const getFoodsLite = async (
  page = 0,
  size = 100,
): Promise<FoodResponse[]> => {
  const response = await api.get<ApiResponse<PageResponse<FoodResponse>>>(
    `${FOOD_BASE}?page=${page}&size=${size}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to fetch foods');
  }

  return response.data.result.content ?? [];
};

export const getFoodImagesByIds = async (
  foodIds: string[],
): Promise<Record<string, string | null>> => {
  return getFoodImageUrlMap(foodIds);
};

export const getFoods = async (
  page = 0,
  size = 100,
): Promise<FoodResponse[]> => {
  const response = await api.get<ApiResponse<PageResponse<FoodResponse>>>(
    `${FOOD_BASE}?page=${page}&size=${size}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to fetch foods');
  }

  const foods = response.data.result.content ?? [];
  if (!foods.length) return foods;

  const imageMap = await getFoodImageUrlMap(foods.map(food => food.id));
  return foods.map(food => ({
    ...food,
    imageUrl: imageMap[food.id] ?? null,
  }));
};

export const searchFoods = async (
  keyword: string,
): Promise<FoodResponse[]> => {
  const response = await api.get<ApiResponse<FoodResponse[]>>(
    `${FOOD_BASE}/search?keyword=${encodeURIComponent(keyword)}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to search foods');
  }

  const foods = response.data.result;
  if (!foods.length) return foods;

  const imageMap = await getFoodImageUrlMap(foods.map(food => food.id));
  return foods.map(food => ({
    ...food,
    imageUrl: imageMap[food.id] ?? null,
  }));
};

export const createMeal = async (data: MealRequest): Promise<MealResponse> => {
  const response = await api.post<ApiResponse<MealResponse>>(MEAL_BASE, data);

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to create meal');
  }

  return response.data.result;
};

export const getMealsByUser = async (
  userId: string,
): Promise<MealResponse[]> => {
  const response = await api.get<ApiResponse<MealResponse[]>>(
    `${MEAL_BASE}/user/${encodeURIComponent(userId)}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to fetch user meals');
  }

  return response.data.result;
};

export const getMealsByDate = async (
  date: string,
  userId: string,
): Promise<MealResponse[]> => {
  const meals = await getMealsByUser(userId);

  return meals.filter(meal => {
    if (!meal?.date) return false;
    return meal.date.slice(0, 10) === date;
  });
};

export const getMealFoodsByMealId = async (
  mealId: string,
): Promise<MealFoodResponse[]> => {
  const response = await api.get<ApiResponse<MealFoodResponse[]>>(
    `${MEAL_FOOD_BASE}/meal/${mealId}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to fetch meal foods');
  }

  return response.data.result;
};

export const addFoodToMeal = async (
  data: MealFoodRequest,
): Promise<MealFoodResponse> => {
  const response = await api.post<ApiResponse<MealFoodResponse>>(MEAL_FOOD_BASE, data);

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to add food to meal');
  }

  return response.data.result;
};

export const removeMealFood = async (id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`${MEAL_FOOD_BASE}/${id}`);

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to remove meal food');
  }
};

export const calculateDailyNutrition = async (
  date: string,
  userId?: string,
): Promise<DailyNutritionResponse> => {
  const userQuery = buildUserQuery(userId);
  const response = await api.post<ApiResponse<DailyNutritionResponse>>(
    `${DAILY_NUTRITION_BASE}/calculate?date=${date}${userQuery}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to calculate daily nutrition');
  }

  return response.data.result;
};

export const getDailyNutritionByDate = async (
  date: string,
  userId?: string,
): Promise<DailyNutritionResponse> => {
  const userQuery = buildUserQuery(userId);
  const response = await api.get<ApiResponse<DailyNutritionResponse>>(
    `${DAILY_NUTRITION_BASE}?date=${date}${userQuery}`,
  );

  if (response.data.code !== 1000) {
    throw new Error(response.data.message || 'Failed to fetch daily nutrition');
  }

  return response.data.result;
};

export const ensureDailyMeals = async (
  date: Date,
  userId: string,
): Promise<MealResponse[]> => {
  const dateStr = formatLocalDate(date);
  const dateTime = formatLocalDateTime(date);

  const existingMeals = await getMealsByDate(dateStr, userId).catch(() => []);
  const existingTypes = new Set(existingMeals.map(meal => meal.mealType));

  const requiredTypes: MealType[] = [
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.SNACK,
    MealType.DINNER,
  ];

  const missingTypes = requiredTypes.filter(type => !existingTypes.has(type));

  if (missingTypes.length === 0) {
    return existingMeals;
  }

  await Promise.all(
    missingTypes.map(type =>
      createMeal({
        user_id: userId,
        date: dateTime,
        mealType: type,
        note: undefined,
      }),
    ),
  );

  return getMealsByDate(dateStr, userId);
};
