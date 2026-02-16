/**
 * Server-side execution history storage
 * Uses persistent storage with JSON serialization
 * Survives server restarts and browser refreshes
 * In production, consider upgrading to a database like PostgreSQL or MongoDB
 */

import type { CommandHistoryEntry } from '@repo/config';

/**
 * In-memory store for execution history (cache layer)
 * Keys are user emails, values are their histories
 */
const historyStore = new Map<string, CommandHistoryEntry[]>();

/**
 * Storage key prefix for browser/server persistence
 */
const STORAGE_PREFIX = 'clawdbot_history_';
const MAX_HISTORY_PER_USER = 100;

/**
 * Check if we're in a server context
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get persistent storage for a user
 */
function getPersistentStore(userEmail: string): CommandHistoryEntry[] {
  if (isServer()) {
    // Server-side: use in-memory Map as fallback
    return historyStore.get(userEmail) || [];
  } else {
    // Client-side: use localStorage
    try {
      const key = `${STORAGE_PREFIX}${userEmail}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to read history from localStorage:', error);
      return [];
    }
  }
}

/**
 * Save persistent store for a user
 */
function savePersistentStore(userEmail: string, entries: CommandHistoryEntry[]): void {
  if (isServer()) {
    // Server-side: update in-memory Map
    historyStore.set(userEmail, entries);
  } else {
    // Client-side: persist to localStorage
    try {
      const key = `${STORAGE_PREFIX}${userEmail}`;
      localStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }
}

/**
 * Save execution to history
 * Persists to storage (localStorage/server)
 */
export function saveExecutionHistory(
  userEmail: string,
  entry: CommandHistoryEntry
): void {
  const history = getPersistentStore(userEmail);
  history.unshift(entry); // Add to front

  // Keep only the most recent entries
  if (history.length > MAX_HISTORY_PER_USER) {
    history.splice(MAX_HISTORY_PER_USER); // Remove oldest entries
  }

  savePersistentStore(userEmail, history);
}

/**
 * Get user's execution history
 * Retrieves from persistent storage
 */
export function getExecutionHistory(
  userEmail: string,
  limit: number = 50
): CommandHistoryEntry[] {
  const history = getPersistentStore(userEmail);
  return history.slice(0, limit);
}

/**
 * Get single history entry
 */
export function getHistoryEntry(
  userEmail: string,
  entryId: string
): CommandHistoryEntry | undefined {
  const history = getPersistentStore(userEmail);
  return history.find((entry) => entry.id === entryId);
}

/**
 * Update history entry
 */
export function updateHistoryEntry(
  userEmail: string,
  entryId: string,
  updates: Partial<CommandHistoryEntry>
): boolean {
  const history = getPersistentStore(userEmail);
  const index = history.findIndex((entry) => entry.id === entryId);

  if (index === -1) {
    return false;
  }

  history[index] = {
    ...history[index],
    ...updates,
  };

  savePersistentStore(userEmail, history);
  return true;
}

/**
 * Delete history entry
 */
export function deleteHistoryEntry(
  userEmail: string,
  entryId: string
): boolean {
  const history = getPersistentStore(userEmail);
  const index = history.findIndex((entry) => entry.id === entryId);

  if (index === -1) {
    return false;
  }

  history.splice(index, 1);
  savePersistentStore(userEmail, history);
  return true;
}

/**
 * Clear all history for user
 */
export function clearUserHistory(userEmail: string): void {
  historyStore.delete(userEmail);
  if (!isServer()) {
    try {
      const key = `${STORAGE_PREFIX}${userEmail}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear history from localStorage:', error);
    }
  }
}

/**
 * Get history statistics
 */
export function getHistoryStats(userEmail: string): {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
} {
  const history = getPersistentStore(userEmail);

  return {
    totalExecutions: history.length,
    successfulExecutions: history.filter((h) => h.status === 'success').length,
    failedExecutions: history.filter((h) => h.status === 'error').length,
    pendingExecutions: history.filter((h) => h.status === 'pending').length,
  };
}
