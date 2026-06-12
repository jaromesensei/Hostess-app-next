import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '@/types';

const STORAGE_KEY = '@woofy_app_state_v1';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const storage = {
  async loadAppState(): Promise<AppState | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return null;
      return JSON.parse(json) as AppState;
    } catch {
      return null;
    }
  },

  // Debounced to avoid thrashing on rapid dispatches
  saveAppState(state: AppState): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage full or unavailable — fail silently
      }
    }, 500);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (!json) return false;
      const state = JSON.parse(json) as AppState;
      return state.isOnboardingComplete && state.dog !== null;
    } catch {
      return false;
    }
  },
};

// Unique ID generator
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
