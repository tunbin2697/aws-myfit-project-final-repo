import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Note: Storage selection is based on PLATFORM, not environment
// - Web: uses localStorage (works in browser)
// - Mobile: uses SecureStore (localStorage doesn't exist on mobile)

/**
 * Custom storage helper to handle environment differences.
 * Uses localStorage in development (web) and expo-secure-store in production (mobile).
 * Note: localStorage is NOT secure, but it enables the app to work in the browser for development.
 */

export const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    } catch (e) {
      console.error('Local storage unavailable:', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Local storage unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
