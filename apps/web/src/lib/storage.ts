/**
 * Client-side storage utilities for history and favorites
 */

import { STORAGE } from '@repo/config';
import type { CommandHistoryEntry } from '@repo/config';

export interface StorageManager {
  saveHistory(entry: CommandHistoryEntry): void;
  getHistory(): CommandHistoryEntry[];
  clearHistory(): void;

  addFavorite(commandId: string): void;
  removeFavorite(commandId: string): void;
  getFavorites(): string[];
  isFavorite(commandId: string): boolean;

  saveSetting(key: string, value: unknown): void;
  getSetting(key: string): unknown;
}

export const createStorageManager = (): StorageManager => {
  const isClient = typeof window !== 'undefined';

  return {
    saveHistory(entry: CommandHistoryEntry) {
      if (!isClient) return;

      try {
        const history = this.getHistory();
        history.unshift(entry);
        history.splice(STORAGE.HISTORY_MAX_ITEMS);
        localStorage.setItem(STORAGE.HISTORY_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    },

    getHistory() {
      if (!isClient) return [];

      try {
        const data = localStorage.getItem(STORAGE.HISTORY_KEY);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Failed to load history:', error);
        return [];
      }
    },

    clearHistory() {
      if (!isClient) return;

      try {
        localStorage.removeItem(STORAGE.HISTORY_KEY);
      } catch (error) {
        console.error('Failed to clear history:', error);
      }
    },

    addFavorite(commandId: string) {
      if (!isClient) return;

      try {
        const favorites = this.getFavorites();
        if (!favorites.includes(commandId)) {
          favorites.push(commandId);
          localStorage.setItem(STORAGE.FAVORITES_KEY, JSON.stringify(favorites));
        }
      } catch (error) {
        console.error('Failed to add favorite:', error);
      }
    },

    removeFavorite(commandId: string) {
      if (!isClient) return;

      try {
        const favorites = this.getFavorites().filter((id) => id !== commandId);
        localStorage.setItem(STORAGE.FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to remove favorite:', error);
      }
    },

    getFavorites() {
      if (!isClient) return [];

      try {
        const data = localStorage.getItem(STORAGE.FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Failed to load favorites:', error);
        return [];
      }
    },

    isFavorite(commandId: string) {
      return this.getFavorites().includes(commandId);
    },

    saveSetting(key: string, value: unknown) {
      if (!isClient) return;

      try {
        const settings = this.getSetting(STORAGE.SETTINGS_KEY) || {};
        (settings as Record<string, unknown>)[key] = value;
        localStorage.setItem(STORAGE.SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save setting:', error);
      }
    },

    getSetting(key: string) {
      if (!isClient) return undefined;

      try {
        const settings = localStorage.getItem(STORAGE.SETTINGS_KEY);
        if (!settings) return undefined;
        const parsed = JSON.parse(settings) as Record<string, unknown>;
        return parsed[key];
      } catch (error) {
        console.error('Failed to load setting:', error);
        return undefined;
      }
    },
  };
};

export const storage = typeof window !== 'undefined' ? createStorageManager() : null;
