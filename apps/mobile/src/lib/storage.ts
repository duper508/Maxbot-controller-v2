import * as SecureStore from 'expo-secure-store';
import { STORAGE, type CommandHistoryEntry } from '@repo/config';

const HISTORY_LIMIT = 100;

export async function getHistory(): Promise<CommandHistoryEntry[]> {
  const raw = await SecureStore.getItemAsync(STORAGE.HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CommandHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(entry: CommandHistoryEntry): Promise<void> {
  const current = await getHistory();
  const next = [entry, ...current].slice(0, HISTORY_LIMIT);
  await SecureStore.setItemAsync(STORAGE.HISTORY_KEY, JSON.stringify(next));
}

export async function clearHistory(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE.HISTORY_KEY);
}
