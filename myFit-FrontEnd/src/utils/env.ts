/**
 * Environment detection utility for DEV FEATURES ONLY
 * (skip login button, mock data, debug tools, etc.)
 * 
 * Priority logic:
 * - If __DEV__ is false (built app) → always production (secure, no override)
 * - If __DEV__ is true (dev server) → check EXPO_PUBLIC_NODE_ENV to allow testing production behavior
 * 
 * Usage:
 * - Set EXPO_PUBLIC_NODE_ENV=production in .env to hide dev features while testing
 * - Set EXPO_PUBLIC_NODE_ENV=development in .env for normal dev mode with dev tools
 * 
 * NOTE: Do NOT use this for platform-specific logic (use Platform.OS instead)
 * - Cognito URL selection → Platform.OS (redirect URIs are platform-specific)
 * - Storage selection → Platform.OS (localStorage only exists on web)
 */

export const isDevelopment = __DEV__ && process.env.EXPO_PUBLIC_NODE_ENV === 'development';

export const isProduction = !isDevelopment;
