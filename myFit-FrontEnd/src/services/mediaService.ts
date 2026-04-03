import { api } from '../api/client';
import type { ApiResponse } from '../types';

type ImageOwner = 'food' | 'workout-plan' | 'exercise';

export interface MediaImageResponse {
  id: string;
  url: string;
  isThumbnail?: boolean | null;
  foodId?: string | null;
  workoutPlanId?: string | null;
  exerciseId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const IMAGE_BASE = '/api/images';
const MAX_CONCURRENT_IMAGE_REQUESTS = 8;

const imageUrlCache = new Map<string, string | null>();
const inflightRequests = new Map<string, Promise<string | null>>();

const cacheKey = (owner: ImageOwner, id: string): string => `${owner}:${id}`;

const pickBestImageUrl = (images: MediaImageResponse[]): string | null => {
  if (!images.length) return null;
  const thumbnail = images.find(image => image?.isThumbnail && image?.url);
  if (thumbnail?.url) return thumbnail.url;

  const firstValid = images.find(image => image?.url);
  return firstValid?.url ?? null;
};

const fetchImageUrl = async (owner: ImageOwner, id: string): Promise<string | null> => {
  try {
    const response = await api.get<ApiResponse<MediaImageResponse[]>>(
      `${IMAGE_BASE}/${owner}/${encodeURIComponent(id)}`,
    );

    if (response.data.code !== 1000) {
      return null;
    }

    return pickBestImageUrl(response.data.result ?? []);
  } catch {
    return null;
  }
};

export const getImageUrlByOwner = async (owner: ImageOwner, id: string): Promise<string | null> => {
  if (!id) return null;

  const key = cacheKey(owner, id);
  const cached = imageUrlCache.get(key);
  if (cached !== undefined) return cached;

  const inflight = inflightRequests.get(key);
  if (inflight) return inflight;

  const request = fetchImageUrl(owner, id).then(url => {
    imageUrlCache.set(key, url);
    inflightRequests.delete(key);
    return url;
  });

  inflightRequests.set(key, request);
  return request;
};

const getImageUrlMapByOwner = async (
  owner: ImageOwner,
  ids: string[],
): Promise<Record<string, string | null>> => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  const entries: Array<readonly [string, string | null]> = [];
  for (let i = 0; i < uniqueIds.length; i += MAX_CONCURRENT_IMAGE_REQUESTS) {
    const batch = uniqueIds.slice(i, i + MAX_CONCURRENT_IMAGE_REQUESTS);
    const batchEntries = await Promise.all(
      batch.map(async id => {
        const url = await getImageUrlByOwner(owner, id);
        return [id, url] as const;
      }),
    );
    entries.push(...batchEntries);
  }

  return Object.fromEntries(entries);
};

export const getFoodImageUrl = async (foodId: string): Promise<string | null> => {
  return getImageUrlByOwner('food', foodId);
};

export const getExerciseImageUrl = async (exerciseId: string): Promise<string | null> => {
  return getImageUrlByOwner('exercise', exerciseId);
};

export const getWorkoutPlanImageUrl = async (workoutPlanId: string): Promise<string | null> => {
  return getImageUrlByOwner('workout-plan', workoutPlanId);
};

export const getFoodImageUrlMap = async (foodIds: string[]): Promise<Record<string, string | null>> => {
  return getImageUrlMapByOwner('food', foodIds);
};

export const getExerciseImageUrlMap = async (
  exerciseIds: string[],
): Promise<Record<string, string | null>> => {
  return getImageUrlMapByOwner('exercise', exerciseIds);
};

export const getWorkoutPlanImageUrlMap = async (
  workoutPlanIds: string[],
): Promise<Record<string, string | null>> => {
  return getImageUrlMapByOwner('workout-plan', workoutPlanIds);
};
